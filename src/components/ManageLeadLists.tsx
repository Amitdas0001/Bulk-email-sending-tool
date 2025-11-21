'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LeadList {
  _id: string;
  name: string;
  description?: string;
  totalLeads: number;
  activeLeads: number;
  createdAt: string;
}

interface Lead {
  _id: string;
  name: string;
  email: string;
  companyName?: string;
  status: string;
}

export default function ManageLeadLists() {
  const { token } = useAuth();
  const [leadLists, setLeadLists] = useState<LeadList[]>([]);
  const [selectedList, setSelectedList] = useState<LeadList | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLeadLists();
  }, []);

  const fetchLeadLists = async () => {
    try {
      const response = await fetch(`${API_URL}/api/lead-lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setLeadLists(data.leadLists);
      }
    } catch (error) {
      console.error('Error fetching lead lists:', error);
    }
  };

  const fetchLeadsFromList = async (listId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/lead-lists/${listId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedList(data.leadList);
        setLeads(data.leads);
        setSelectedLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Delete this list and all its leads? This cannot be undone.')) return;

    try {
      const response = await fetch(`${API_URL}/api/lead-lists/${listId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage('✅ List deleted successfully');
        fetchLeadLists();
        if (selectedList?._id === listId) {
          setSelectedList(null);
          setLeads([]);
        }
      } else {
        setMessage('❌ Failed to delete list');
      }
    } catch (error) {
      setMessage('❌ Error deleting list');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    if (!confirm(`Delete ${selectedLeads.length} selected leads?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/lead-lists/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ leadIds: selectedLeads }),
      });

      if (response.ok) {
        setMessage(`✅ ${selectedLeads.length} leads deleted`);
        if (selectedList) {
          fetchLeadsFromList(selectedList._id);
        }
        fetchLeadLists();
      } else {
        setMessage('❌ Failed to delete leads');
      }
    } catch (error) {
      setMessage('❌ Error deleting leads');
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead._id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Lead Lists</h1>

      {message && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Lists Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Your Lists</h2>
            
            {leadLists.length === 0 ? (
              <p className="text-gray-500 text-sm">No lead lists yet. Upload a CSV to create one.</p>
            ) : (
              <div className="space-y-2">
                {leadLists.map((list) => (
                  <div
                    key={list._id}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selectedList?._id === list._id
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => fetchLeadsFromList(list._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{list.name}</h3>
                        {list.description && (
                          <p className="text-xs text-gray-600 mt-1">{list.description}</p>
                        )}
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          <span>📊 {list.totalLeads} total</span>
                          <span>✅ {list.activeLeads} active</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list._id);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leads Table */}
        <div className="lg:col-span-2">
          {selectedList ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedList.name}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {leads.length} leads in this list
                    </p>
                  </div>
                  {selectedLeads.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      Delete Selected ({selectedLeads.length})
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No leads in this list</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedLeads.length === leads.length}
                            onChange={toggleSelectAll}
                            className="rounded"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Company</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead._id)}
                              onChange={() => toggleLeadSelection(lead._id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{lead.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{lead.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{lead.companyName || '-'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                lead.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {lead.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p className="text-lg">👈 Select a list to view leads</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
