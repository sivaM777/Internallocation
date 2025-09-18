import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { StatsDashboard } from "@/components/StatsDashboard";
import { FairnessMonitor } from "@/components/FairnessMonitor";
import { MatchingControl } from "@/components/MatchingControl";
import { AuditLog } from "@/components/AuditLog";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'student' | 'company' | 'admin'>('admin');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only admins can access admin dashboard
  if (user?.role !== 'admin') {
    if (user?.role === 'student') {
      return <Redirect to="/" />;
    }
    if (user?.role === 'company') {
      return <Redirect to="/company" />;
    }
    return <Redirect to="/auth" />;
  }

  // Handle view changes - redirect to appropriate dashboard
  const handleViewChange = (view: 'student' | 'company' | 'admin') => {
    if (view === 'student') {
      window.location.href = '/';
    } else if (view === 'company') {
      window.location.href = '/company';
    } else {
      setCurrentView(view);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentView={currentView} onViewChange={handleViewChange} />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Statistics Dashboard - Full Width */}
          <div className="xl:col-span-12">
            <StatsDashboard />
          </div>
          
          {/* Left Column - Fairness Monitoring */}
          <div className="xl:col-span-6">
            <FairnessMonitor />
          </div>
          
          {/* Right Column - Matching Control & Audit */}
          <div className="xl:col-span-6 space-y-8">
            <MatchingControl />
            <AuditLog />
          </div>
        </div>
      </main>
    </div>
  );
}
