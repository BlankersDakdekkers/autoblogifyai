import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ResponsiveContainer } from '@/components/ui/responsive-components';
import { EnhancedPerformanceMonitor } from '@/components/EnhancedPerformanceMonitor';
import { ProductionDashboard } from '@/components/dashboard/ProductionDashboard';
import { AdminSetup } from '@/components/AdminSetup';
import { NewUserDashboard } from '@/components/NewUserDashboard';

const Dashboard = () => {
  const { user, profile, userRole } = useAuth();

  // Show admin setup for admin users
  if (userRole === 'admin') {
    return <AdminSetup />;
  }

  // Show new user dashboard for users without profile or new users
  if (!profile || !profile.onboarding_completed) {
    return <NewUserDashboard />;
  }

  // Show production dashboard for established users
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <ResponsiveContainer maxWidth="7xl">
        <div className="py-8">
          <ProductionDashboard />
        </div>
      </ResponsiveContainer>
      <EnhancedPerformanceMonitor />
    </div>
  );
};

export default Dashboard;