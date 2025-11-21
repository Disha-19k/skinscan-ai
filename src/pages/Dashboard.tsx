import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Upload, History, Activity } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/ImageUpload';
import ResultsDisplay from '@/components/ResultsDisplay';
import ScanHistory from '@/components/ScanHistory';
import { predictSkinCondition, getGeminiInsights, PredictionResult } from '@/services/api';

export interface ScanRecord extends PredictionResult {
  id: string;
  timestamp: number;
  imageDataUrl: string;
  insights?: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanRecord | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>(() => {
    const stored = localStorage.getItem('scanHistory');
    return stored ? JSON.parse(stored) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleFileSelect = useCallback((file: File, preview: string) => {
    setSelectedFile(file);
    setImagePreview(preview);
    setCurrentResult(null);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const prediction = await predictSkinCondition(selectedFile);
      const insights = await getGeminiInsights(prediction.prediction);

      const scanRecord: ScanRecord = {
        ...prediction,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        imageDataUrl: imagePreview!,
        insights: insights.text,
      };

      setCurrentResult(scanRecord);
      const updatedHistory = [scanRecord, ...scanHistory];
      setScanHistory(updatedHistory);
      localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Skin Health AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showHistory ? (
          <ScanHistory
            scans={scanHistory}
            onClose={() => setShowHistory(false)}
            onViewScan={(scan) => {
              setCurrentResult(scan);
              setShowHistory(false);
            }}
          />
        ) : currentResult ? (
          <ResultsDisplay
            result={currentResult}
            onNewScan={() => {
              setCurrentResult(null);
              setSelectedFile(null);
              setImagePreview(null);
            }}
          />
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Skin Image</CardTitle>
                <CardDescription>
                  Upload a clear image of the affected skin area for AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImageUpload onFileSelect={handleFileSelect} preview={imagePreview} />
                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>Analyzing...</>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Analyze Skin Condition
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
