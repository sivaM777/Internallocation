import { Navbar } from "@/components/Navbar";
import { ProfileForm } from "@/components/ProfileForm";
import { MatchPreview } from "@/components/MatchPreview";
import { MatchResults } from "@/components/MatchResults";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function StudentDashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect non-students to appropriate dashboard
  if (user?.role === 'company') {
    return <Redirect to="/company" />;
  }
  if (user?.role === 'admin') {
    return <Redirect to="/admin" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentView="student" onViewChange={() => {}} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Management */}
          <div className="lg:col-span-1">
            <ProfileForm />
          </div>
          
          {/* Center Column - Match Preview */}
          <div className="lg:col-span-1">
            <MatchPreview />
          </div>
          
          {/* Right Column - Match Results */}
          <div className="lg:col-span-1">
            <MatchResults />
          </div>
        </div>
      </main>
    </div>
  );
}
