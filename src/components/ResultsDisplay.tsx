import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Info, ArrowLeft } from 'lucide-react';
import { ScanRecord } from '@/pages/Dashboard';

interface ResultsDisplayProps {
  result: ScanRecord;
  onNewScan: () => void;
}

const ResultsDisplay = ({ result, onNewScan }: ResultsDisplayProps) => {
  const confidenceColor =
    result.confidence >= 0.8 ? 'text-secondary' : result.confidence >= 0.6 ? 'text-yellow-600' : 'text-destructive';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" onClick={onNewScan}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        New Scan
      </Button>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Image</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={result.imageDataUrl} alt="Uploaded" className="w-full rounded-lg" />
          </CardContent>
        </Card>

        {result.processed_image_url && (
          <Card>
            <CardHeader>
              <CardTitle>Detection Result</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={result.processed_image_url} alt="Processed" className="w-full rounded-lg" />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Detection Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Detected Condition</p>
              <p className="text-2xl font-bold">{result.prediction}</p>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <span className={confidenceColor}>{(result.confidence * 100).toFixed(1)}%</span>
            </Badge>
          </div>
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              This is an AI-powered analysis for educational purposes only. Please consult a dermatologist for
              professional medical advice.
            </p>
          </div>
        </CardContent>
      </Card>

      {result.insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-secondary" />
              AI Health Insights
            </CardTitle>
            <CardDescription>Educational information about the detected condition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-foreground">{result.insights}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsDisplay;
