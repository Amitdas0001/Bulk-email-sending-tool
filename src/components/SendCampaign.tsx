'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Campaign {
  _id: string;
  name: string;
  subject: string;
  status: 'draft' | 'sending' | 'sent';
  campaignToken: string;
  createdAt: string;
}

interface LeadList {
  _id: string;
  name: string;
  totalLeads: number;
  activeLeads: number;
}

export default function SendCampaign() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError('');
        
        // Fetch campaigns
        const campaignsRes = await fetch(`${API_URL}/api/campaigns`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!campaignsRes.ok) throw new Error('Failed to fetch campaigns.');
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.campaigns.filter((c: Campaign) => c.status === 'draft'));

        // Fetch lead lists
        const listsRes = await fetch(`${API_URL}/api/lead-lists`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (listsRes.ok) {
          const listsData = await listsRes.json();
          setLeadLists(listsData.leadLists);
        }
      } catch (err) {
        setError('Could not load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const toggleListSelection = (listId: string) => {
    setSelectedLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const getTotalRecipients = () => {
    if (selectedLists.length === 0) {
      return leadLists.reduce((sum, list) => sum + list.activeLeads, 0);
    }
    return leadLists
      .filter(list => selectedLists.includes(list._id))
      .reduce((sum, list) => sum + list.activeLeads, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) {
      setError('Please select a campaign to send.');
      return;
    }

    const totalRecipients = getTotalRecipients();
    if (totalRecipients === 0) {
      setError('No active leads to send to. Please select lead lists with active leads.');
      return;
    }
    
    setSending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          campaignId: selectedCampaign,
          leadListIds: selectedLists.length > 0 ? selectedLists : undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`${data.message} Sending to ${data.totalRecipients} recipients.`);
        setCampaigns(campaigns.filter(c => c._id !== selectedCampaign));
        setSelectedCampaign('');
        setSelectedLists([]);
      } else {
        setError(data.error || 'Failed to send campaign.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Send Email Campaign</h1>
        
        {loading && <p>Loading...</p>}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {!loading && campaigns.length === 0 && (
          <p className="text-gray-500">You have no draft campaigns to send. Go create one!</p>
        )}

        {!loading && campaigns.length > 0 && (
          <form onSubmit={handleSubmit}>
            {/* Campaign Selection */}
            <div className="mb-6">
              <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-2">
                Select Campaign *
              </label>
              <select
                id="campaign"
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Choose a campaign --</option>
                {campaigns.map((campaign) => (
                  <option key={campaign._id} value={campaign._id}>
                    {campaign.name} (Subject: {campaign.subject})
                  </option>
                ))}
              </select>
            </div>

            {/* Lead Lists Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Lead Lists (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Leave all unchecked to send to all active leads, or select specific lists.
              </p>
              
              {leadLists.length === 0 ? (
                <p className="text-sm text-gray-500">No lead lists available. Upload leads first.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {leadLists.map((list) => (
                    <label
                      key={list._id}
                      className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLists.includes(list._id)}
                        onChange={() => toggleListSelection(list._id)}
                        className="rounded mr-3"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{list.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({list.activeLeads} active leads)
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Recipients Summary */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-900">
                <strong>Total Recipients:</strong> {getTotalRecipients()} active leads
              </p>
              {selectedLists.length > 0 && (
                <p className="text-xs text-blue-700 mt-1">
                  From {selectedLists.length} selected list(s)
                </p>
              )}
              {selectedLists.length === 0 && leadLists.length > 0 && (
                <p className="text-xs text-blue-700 mt-1">
                  From all {leadLists.length} list(s)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={sending || !selectedCampaign || getTotalRecipients() === 0}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Initiating Send...' : `Send Campaign to ${getTotalRecipients()} Recipients`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}