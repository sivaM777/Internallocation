import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { History, Download, Search, Info, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AuditEntry {
  id: number;
  studentName: string;
  internshipTitle: string;
  companyName: string;
  matchScore: string;
  status: 'matched' | 'applied' | 'shortlisted' | 'rejected';
  timestamp: string;
  explanation?: string;
}

export function AuditLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: auditEntries = [], isLoading } = useQuery({
    queryKey: ["/api/admin/audit"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched':
        return 'bg-green-100 text-green-800';
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-purple-100 text-purple-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "match-score-high";
    if (score >= 50) return "match-score-medium";
    return "match-score-low";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const filteredEntries = auditEntries.filter((entry: AuditEntry) => {
    const matchesSearch = searchQuery === "" || 
      entry.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.internshipTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2 text-accent" />
            Audit Trail
          </CardTitle>
          <Button className="bg-accent text-accent-foreground" data-testid="button-export-audit">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search student name, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-audit-search"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="matched">Matched</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audit Entries */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg animate-pulse">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-6 bg-muted rounded"></div>
                </div>
              ))
            ) : filteredEntries.length > 0 ? (
              filteredEntries.map((entry: AuditEntry, index: number) => (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors duration-200"
                  data-testid={`audit-entry-${index}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {entry.studentName || 'Unknown Student'}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {entry.internshipTitle || 'Unknown Internship'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{entry.companyName || 'Unknown Company'}</span>
                      <span>•</span>
                      <span>{formatTime(entry.timestamp)}</span>
                      <span>•</span>
                      <Badge className={`${getScoreColor(parseFloat(entry.matchScore))} px-1 py-0.5 text-xs`}>
                        {Math.round(parseFloat(entry.matchScore) || 0)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(entry.status)} px-2 py-1 text-xs`}>
                      {entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1) || 'Unknown'}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary hover:text-primary-foreground p-1 rounded">
                      <Info className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit entries found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Summary Statistics */}
          {!isLoading && filteredEntries.length > 0 && (
            <div className="border-t border-border pt-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{filteredEntries.length}</p>
                  <p className="text-xs text-muted-foreground">Total Entries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredEntries.filter((e: AuditEntry) => e.status === 'matched').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Matched</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredEntries.filter((e: AuditEntry) => e.status === 'applied').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Applied</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">
                    {filteredEntries.length > 0 
                      ? Math.round(filteredEntries.reduce((acc: number, e: AuditEntry) => acc + parseFloat(e.matchScore || '0'), 0) / filteredEntries.length)
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
