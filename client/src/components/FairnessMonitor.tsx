import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Scale, CheckCircle, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function FairnessMonitor() {
  const { data: metrics = {}, isLoading } = useQuery({
    queryKey: ["/api/admin/fairness"],
  });

  const alerts = [
    {
      type: "success",
      message: "Gender balance improved",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-50 border-green-200"
    },
    {
      type: "warning",
      message: "Regional disparity detected in Tech sector",
      time: "5 hours ago",
      icon: AlertTriangle,
      color: "text-yellow-500",
      bg: "bg-yellow-50 border-yellow-200"
    }
  ];

  const diversityMetrics = [
    {
      label: "Gender Balance",
      value: "68% / 32%",
      percentage: 68,
      status: "good"
    },
    {
      label: "Regional Distribution",
      value: "Balanced",
      percentage: 85,
      status: "good"
    },
    {
      label: "Minority Groups",
      value: `${metrics.diversityPercentage || 23}%`,
      percentage: metrics.diversityPercentage || 23,
      status: "warning"
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-2 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Scale className="h-5 w-5 mr-2 text-accent" />
            Fairness Monitoring
          </CardTitle>
          <div className="flex space-x-2">
            <Badge className="bg-green-100 text-green-800">Good</Badge>
            <Button variant="ghost" size="sm" className="text-primary hover:underline">
              View Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Diversity Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Diversity Allocation</h3>
            <div className="space-y-3">
              {diversityMetrics.map((metric, index) => (
                <div key={index} data-testid={`diversity-metric-${index}`}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="text-foreground">{metric.value}</span>
                  </div>
                  <Progress 
                    value={metric.percentage} 
                    className="w-full h-2"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Recent Alerts</h3>
            <div className="space-y-2">
              {alerts.map((alert, index) => {
                const Icon = alert.icon;
                return (
                  <div 
                    key={index}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${alert.bg}`}
                    data-testid={`alert-${index}`}
                  >
                    <Icon className={`${alert.color} text-sm mt-0.5`} />
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs opacity-75">{alert.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Actions */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Recommended Actions</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    Boost diversity matching for Finance internships
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expected impact: +15% minority allocation
                  </p>
                </div>
                <Button size="sm" data-testid="button-apply-recommendation">
                  Apply
                </Button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{metrics.totalWithDiversity || 289}</p>
              <p className="text-xs text-muted-foreground">Students with diversity flag</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">{metrics.diversityPercentage || 23}%</p>
              <p className="text-xs text-muted-foreground">Diversity representation</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
