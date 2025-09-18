import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Settings, Play, RotateCcw, StopCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function MatchingControl() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [algorithmSettings, setAlgorithmSettings] = useState({
    skillsWeight: 50,
    cgpaWeight: 20,
    locationWeight: 10,
    diversityWeight: 20
  });

  const bulkMatchingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/match/run");
      return await res.json();
    },
    onSuccess: (data) => {
      setIsRunning(false);
      setProgress(100);
      toast({
        title: "Matching Complete",
        description: `Successfully processed ${data.processedCount} students`,
      });
    },
    onError: (error: Error) => {
      setIsRunning(false);
      setProgress(0);
      toast({
        title: "Matching Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const incrementalMatchingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/match/bulk");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Incremental Matching Complete",
        description: "New matches have been processed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Incremental Matching Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBulkMatching = () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 500);

    bulkMatchingMutation.mutate();
  };

  const handleEmergencyStop = () => {
    setIsRunning(false);
    setProgress(0);
    toast({
      title: "Emergency Stop",
      description: "Matching process has been stopped",
      variant: "destructive",
    });
  };

  const updateSetting = (key: keyof typeof algorithmSettings, value: number) => {
    setAlgorithmSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-primary" />
            Matching Engine
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Last run: <span data-testid="last-run-time">2 hours ago</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Status */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-sm font-medium text-foreground">
                  System Status: {isRunning ? 'Processing' : 'Active'}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">Processing queue: {isRunning ? '...' : '0'}</span>
            </div>
            
            {isRunning && (
              <div className="mb-3">
                <Progress value={progress} className="w-full h-2" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary" data-testid="pending-matches">127</p>
                <p className="text-xs text-muted-foreground">Pending Matches</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent" data-testid="processed-today">89</p>
                <p className="text-xs text-muted-foreground">Processed Today</p>
              </div>
            </div>
          </div>

          {/* Manual Controls */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Manual Operations</h3>
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={handleBulkMatching}
                disabled={isRunning || bulkMatchingMutation.isPending}
                data-testid="button-run-matching"
              >
                <Play className="h-4 w-4 mr-2" />
                {isRunning ? "Processing..." : "Run Full Matching Process"}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => incrementalMatchingMutation.mutate()}
                disabled={isRunning || incrementalMatchingMutation.isPending}
                data-testid="button-incremental-matching"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {incrementalMatchingMutation.isPending ? "Processing..." : "Incremental Matching"}
              </Button>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleEmergencyStop}
                disabled={!isRunning}
                data-testid="button-emergency-stop"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Emergency Stop
              </Button>
            </div>
          </div>

          {/* Algorithm Settings */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Algorithm Settings</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Skills Weight: {algorithmSettings.skillsWeight}%</Label>
                <Slider
                  value={[algorithmSettings.skillsWeight]}
                  onValueChange={(value) => updateSetting('skillsWeight', value[0])}
                  max={100}
                  step={1}
                  className="mt-1"
                  data-testid="slider-skills-weight"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">CGPA Weight: {algorithmSettings.cgpaWeight}%</Label>
                <Slider
                  value={[algorithmSettings.cgpaWeight]}
                  onValueChange={(value) => updateSetting('cgpaWeight', value[0])}
                  max={100}
                  step={1}
                  className="mt-1"
                  data-testid="slider-cgpa-weight"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Location Weight: {algorithmSettings.locationWeight}%</Label>
                <Slider
                  value={[algorithmSettings.locationWeight]}
                  onValueChange={(value) => updateSetting('locationWeight', value[0])}
                  max={100}
                  step={1}
                  className="mt-1"
                  data-testid="slider-location-weight"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Diversity Weight: {algorithmSettings.diversityWeight}%</Label>
                <Slider
                  value={[algorithmSettings.diversityWeight]}
                  onValueChange={(value) => updateSetting('diversityWeight', value[0])}
                  max={100}
                  step={1}
                  className="mt-1"
                  data-testid="slider-diversity-weight"
                />
              </div>
              
              {/* Weight Total Indicator */}
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Weight:</span>
                  <span className={`font-medium ${
                    Object.values(algorithmSettings).reduce((a, b) => a + b, 0) === 100 
                      ? 'text-green-600' 
                      : 'text-orange-600'
                  }`}>
                    {Object.values(algorithmSettings).reduce((a, b) => a + b, 0)}%
                  </span>
                </div>
                {Object.values(algorithmSettings).reduce((a, b) => a + b, 0) !== 100 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Warning: Weights should total 100%
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
