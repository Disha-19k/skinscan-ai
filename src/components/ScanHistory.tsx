import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Eye } from 'lucide-react';
import { ScanRecord } from '@/pages/Dashboard';

interface ScanHistoryProps {
  scans: ScanRecord[];
  onClose: () => void;
  onViewScan: (scan: ScanRecord) => void;
}

const ScanHistory = ({ scans, onClose, onViewScan }: ScanHistoryProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Scan History</CardTitle>
              <CardDescription>View your previous skin analyses</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {scans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No scans yet. Upload your first image to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <img
                    src={scan.imageDataUrl}
                    alt="Scan"
                    className="h-16 w-16 rounded object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{scan.prediction}</p>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {(scan.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(scan.timestamp)}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onViewScan(scan)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScanHistory;
