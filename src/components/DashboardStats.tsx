'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Stats {
  totalCampaigns: number;
  totalLeads: number;
  emailsSent: number;
  openRate: number;
}

export default function DashboardStats({ activeTab }: { activeTab: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    
    const fetchStats = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        
        const response = await fetch(`${API_URL}/api/stats/summary`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await response.json();
        
        
        setStats({
          totalCampaigns: data.totalCampaigns,
          totalLeads: data.totalLeads,
          emailsSent: data.emailsSent,
          openRate: data.openRate,
        });
        
      } catch (err) {
        setError('Failed to load stats. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [token, activeTab]);

  if (loading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg shadow p-6 h-28 animate-pulse"></div>
            ))}
        </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Campaigns</h3>
        <p className="text-3xl font-semibold text-gray-900">{stats?.totalCampaigns}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Leads</h3>
        <p className="text-3xl font-semibold text-gray-900">{stats?.totalLeads}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Emails Sent</h3>
        <p className="text-3xl font-semibold text-gray-900">{stats?.emailsSent}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Open Rate</h3>
        <p className="text-3xl font-semibold text-gray-900">{stats?.openRate.toFixed(1)}%</p>
      </div>
    </div>
  );
}