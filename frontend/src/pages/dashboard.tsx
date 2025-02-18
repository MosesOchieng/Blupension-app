'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BalanceOverview from '@/components/dashboard/BalanceOverview';
import InvestmentDistribution from '@/components/dashboard/InvestmentDistribution';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import QuickActions from '@/components/dashboard/QuickActions';
import { fetchDashboardData } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import type { DashboardData } from '@/types/api';
import { motion } from 'framer-motion';
import BPTManagement from '@/components/bpt/BPTManagement';
import AirdropNotification from '@/components/notifications/AirdropNotification';
import WalletManager from '@/components/wallet/WalletManager';

export default function Dashboard() {
  const { user, isEmailVerified } = useAuth();
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
  });

  const [showAirdrop, setShowAirdrop] = useState(false);
  const [airdropAmount, setAirdropAmount] = useState(0);
  
  // Simulate airdrop check
  useEffect(() => {
    const checkAirdrops = async () => {
      // In reality, this would be an API call
      const hasAirdrop = Math.random() > 0.5;
      if (hasAirdrop) {
        const amount = Math.floor(Math.random() * 100) + 50;
        setAirdropAmount(amount);
        setShowAirdrop(true);
      }
    };

    const interval = setInterval(checkAirdrops, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-96 bg-gray-200 rounded-lg" />
            <div className="h-96 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load dashboard data</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {!isEmailVerified && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please verify your email address to unlock all features.{' '}
                <a href="/verify-email/notice" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                  Resend verification email
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Quick Actions */}
        <QuickActions />

        {/* Balance Overview */}
        <BalanceOverview
          totalBalance={data.totalBalance}
          stablecoinBalance={data.stablecoinBalance}
          growingAssetsBalance={data.growingAssetsBalance}
          percentageChange={data.percentageChange}
        />

        <WalletManager />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow">
            <PerformanceChart data={data.performanceData} />
          </div>

          {/* Investment Distribution */}
          <div className="bg-white rounded-lg shadow">
            <InvestmentDistribution
              stablecoinPercentage={data.stablecoinPercentage}
              growingAssetsPercentage={data.growingAssetsPercentage}
            />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <RecentTransactions transactions={data.recentTransactions} />
        </div>

        <BPTManagement />
      </div>

      <AirdropNotification
        show={showAirdrop}
        onClose={() => setShowAirdrop(false)}
        amount={airdropAmount}
      />
    </DashboardLayout>
  );
} 