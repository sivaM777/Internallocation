import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { InternshipForm } from "@/components/InternshipForm";
import { CandidateList } from "@/components/CandidateList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Edit, Trash, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";

export default function CompanyDashboard() {
  const { user, isLoading } = useAuth();
  const [selectedInternshipId, setSelectedInternshipId] = useState<number | null>(null);

  interface CompanyProfile {
    id?: number;
    name?: string;
    location?: string;
    industry?: string;
  }

  // Get company profile to fetch internships
  const { data: profile } = useQuery({
    queryKey: ["/api/companies/profile"],
    enabled: user?.role === 'company',
  });

  const typedProfile = profile as CompanyProfile;

  const { data: internships = [], isLoading: internshipsLoading } = useQuery({
    queryKey: ["/api/internships/company", typedProfile?.id],
    enabled: !!typedProfile?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect non-companies to appropriate dashboard
  if (user?.role === 'student') {
    return <Redirect to="/" />;
  }
  if (user?.role === 'admin') {
    return <Redirect to="/admin" />;
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Draft";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentView="company" onViewChange={() => {}} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column - Internship Creation */}
          <div className="xl:col-span-1">
            <InternshipForm />
          </div>
          
          {/* Center Column - Posted Internships */}
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-accent" />
                  Your Internships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {internshipsLoading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="border border-border rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    ))
                  ) : (internships as any[]).length > 0 ? (
                    (internships as any[]).map((internship: any) => (
                      <div key={internship.id} className="border border-border rounded-lg p-4" data-testid={`internship-${internship.id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{internship.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Posted {new Date(internship.createdAt).toLocaleDateString()} • {internship.positions} position{internship.positions > 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center mt-1">
                              <Badge className={getStatusColor(internship.isActive)}>
                                {getStatusText(internship.isActive)}
                              </Badge>
                              <span className="mx-2 text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">0 applications</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary hover:text-primary-foreground p-1 rounded">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive p-1 rounded">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {internship.requiredSkills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {internship.requiredSkills.slice(0, 3).map((skill: string, index: number) => (
                              <Badge key={index} className="bg-secondary text-secondary-foreground text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {internship.requiredSkills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{internship.requiredSkills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setSelectedInternshipId(internship.id)}
                          data-testid={`button-view-candidates-${internship.id}`}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          View Candidates
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No internships posted yet. Create your first internship to start receiving applications.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Candidate List */}
          <div className="xl:col-span-1">
            <CandidateList internshipId={selectedInternshipId || undefined} />
          </div>
        </div>
      </main>
    </div>
  );
}
