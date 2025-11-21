import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, Sparkles, Shield, Zap } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Skin Health AI</span>
        </div>
        <Button asChild>
          <Link to="/auth">Get Started</Link>
        </Button>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            AI-Powered Skin Disease Detection
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload a photo and get instant AI analysis of skin conditions with detailed insights and recommendations
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link to="/auth">Start Free Analysis</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-lg bg-card border">
              <Sparkles className="h-12 w-12 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">YOLOv8 Detection</h3>
              <p className="text-muted-foreground">
                State-of-the-art object detection model for accurate skin condition identification
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <Zap className="h-12 w-12 text-secondary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Gemini AI Insights</h3>
              <p className="text-muted-foreground">
                Get detailed medical insights and care recommendations powered by Google Gemini
              </p>
            </div>
            <div className="p-6 rounded-lg bg-card border">
              <Shield className="h-12 w-12 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your scans are stored securely and accessible only to you
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
