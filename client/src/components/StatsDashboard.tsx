import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartLine, Users, Briefcase, Handshake, PieChart, Download, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function StatsDashboard() {
  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const metricCards = [
    {
      title: "Total Students",
      value: stats.totalStudents || 0,
      change: "+12% from last month",
      icon: Users,
      gradient: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      iconBg: "bg-blue-500"
    },
    {
      title: "Active Internships",
      value: stats.activeInternships || 0,
      change: "+8% from last month",
      icon: Briefcase,
      gradient: "from-green-50 to-green-100",
      border: "border-green-200",
      iconBg: "bg-green-500"
    },
    {
      title: "Successful Matches",
      value: stats.successfulMatches || 0,
      change: "+24% from last month",
      icon: Handshake,
      gradient: "from-purple-50 to-purple-100",
      border: "border-purple-200",
      iconBg: "bg-purple-500"
    },
    {
      title: "Average Match Score",
      value: `${stats.avgMatchScore || 0}%`,
      change: "+3.2% from last month",
      icon: PieChart,
      gradient: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      iconBg: "bg-orange-500"
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="p-6 border border-border rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-2xl font-bold">
            <ChartLine className="h-6 w-6 mr-3 text-primary" />
            System Overview
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Select defaultValue="7days">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button data-testid="button-export-stats">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div 
                key={index}
                className={`bg-gradient-to-br ${metric.gradient} p-6 rounded-lg border ${metric.border}`}
                data-testid={`metric-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-70 mb-1">{metric.title}</p>
                    <p className="text-3xl font-bold mb-1">{metric.value}</p>
                    <p className="text-xs opacity-60 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {metric.change}
                    </p>
                  </div>
                  <div className={`p-3 ${metric.iconBg} rounded-full`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Match Success Rate</h3>
            <div className="chart-container p-4 rounded-lg h-64 flex items-center justify-center text-white">
              <div className="text-center">
                <ChartLine className="h-12 w-12 mb-4 mx-auto" />
                <p className="text-sm mb-2">Interactive Chart Component</p>
                <p className="text-xs opacity-75">Daily match success trends</p>
                <div className="mt-4 text-xs">
                  <p>Average success rate: 84.3%</p>
                  <p>Peak matching time: 10-11 AM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Skill Distribution</h3>
            <div className="chart-container p-4 rounded-lg h-64 flex items-center justify-center text-white">
              <div className="text-center">
                <PieChart className="h-12 w-12 mb-4 mx-auto" />
                <p className="text-sm mb-2">Skill Popularity Chart</p>
                <p className="text-xs opacity-75">Most in-demand skills</p>
                <div className="mt-4 text-xs">
                  <p>Top skills: Python, React, ML</p>
                  <p>Emerging: Docker, Kubernetes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
