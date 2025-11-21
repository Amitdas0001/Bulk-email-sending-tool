'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UploadLeads from './UploadLeads';
import DashboardStats from './DashboardStats';
import CreateCampaign from './CreateCampaign';
import SendCampaign from './SendCampaign';
import ManageLeadLists from './ManageLeadLists';
import TrackCampaign from './TrackCampaign';
import SettingsPage from './SettingsPage';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'manage-leads', label: 'Manage Leads', icon: '👥' },
  { id: 'upload-leads', label: 'Upload Leads', icon: '📤' },
  { id: 'create-campaign', label: 'Create Campaign', icon: '✉️' },
  { id: 'send-emails', label: 'Send Emails', icon: '🚀' },
  { id: 'track-campaign', label: 'Track Campaign', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.firstName}!
            </h1>
            <DashboardStats activeTab={activeTab} />
          </div>
        );
      case 'upload-leads':
        return <UploadLeads />;
      case 'create-campaign':
        return <CreateCampaign />;
      case 'send-emails':
        return <SendCampaign />;
      case 'manage-leads':
        return <ManageLeadLists />;
      case 'track-campaign':
        
        return <TrackCampaign activeTab={activeTab} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md relative">
        <div className="p-6">
          <h2 className="text-xl font-bold text-blue-600">EmailSaaS</h2>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-6 py-3 flex items-center space-x-3 hover:bg-gray-50 ${
                activeTab === item.id
                  ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                  : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-6">
          <div className="border-t pt-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full text-left text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Log Out
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}