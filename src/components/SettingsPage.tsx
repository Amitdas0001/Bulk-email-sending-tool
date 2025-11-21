'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SettingsPage() {
  const [settings, setSettings] = useState({ host: '', port: 587, user: '', pass: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) return;
      try {
        
        const response = await fetch(`${API_URL}/api/settings`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok && data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      } catch (err) {
        setError('Failed to load existing settings.');
      }
    };
    fetchSettings();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      
      
      
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
      } else {
        setError(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">SMTP Settings</h1>
        <p className="text-sm text-gray-600 mb-6">
          Configure your email sending service. For Gmail/Google Workspace, you must generate an &quot;App Password&quot;.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="host" className="block text-sm font-medium text-gray-700">SMTP Host</label>
              <input type="text" name="host" id="host" value={settings.host} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-500" placeholder="e.g., smtp.gmail.com" />
            </div>
            <div>
              <label htmlFor="port" className="block text-sm font-medium text-gray-700">SMTP Port</label>
              <input type="number" name="port" id="port" value={settings.port} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-500" placeholder="e.g., 587" />
            </div>
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700">Username / Email</label>
              <input type="text" name="user" id="user" value={settings.user} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-500" placeholder="your-email@example.com" />
            </div>
            <div>
              <label htmlFor="pass" className="block text-sm font-medium text-gray-700">Password / App Password</label>
              <input type="password" name="pass" id="pass" value={settings.pass} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-500" placeholder="Enter your app password" />
              <p className="mt-2 text-xs text-gray-500">For Gmail, you must use a 16-character App Password.</p>
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-4">{success}</p>}

          <div className="mt-8">
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}