'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Lead {
  _id: string;
  name: string;
  email: string;
  companyName?: string;
}

export default function ManageLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchLeads = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`${API_URL}/api/leads`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch leads.');
        const data = await response.json();
        setLeads(data.leads);
      } catch (err) {
        setError('Could not load leads.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [token]);

  const handleDelete = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await fetch(`${API_URL}/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete lead.');
      setLeads(leads.filter(lead => lead._id !== leadId));
    } catch (err) {
      setError('Could not delete lead.');
    }
  };

  const handleEditSubmit = async (formData: Omit<Lead, '_id'>) => {
    if (!editingLead) return;
    try {
      const response = await fetch(`${API_URL}/api/leads/${editingLead._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to update lead.');
      const updatedLead = await response.json();
      setLeads(leads.map(lead => (lead._id === updatedLead._id ? updatedLead : lead)));
      setEditingLead(null);
    } catch (err) {
      setError('Could not update lead.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Leads</h1>
      
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      
      {loading ? (
        <p>Loading leads...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map(lead => (
                <tr key={lead._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.companyName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    <button onClick={() => setEditingLead(lead)} className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button onClick={() => handleDelete(lead._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && <p className="p-6 text-center text-gray-500">No leads found.</p>}
        </div>
      )}

      {editingLead && (
        <EditModal 
          lead={editingLead} 
          onClose={() => setEditingLead(null)} 
          onSave={handleEditSubmit} 
        />
      )}
    </div>
  );
}


interface EditModalProps {
  lead: Lead;
  onClose: () => void;
  onSave: (formData: Omit<Lead, '_id'>) => void;
}

function EditModal({ lead, onClose, onSave }: EditModalProps) {
  const [formData, setFormData] = useState({
    name: lead.name,
    email: lead.email,
    companyName: lead.companyName || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-10 bg-gray-500 bg-opacity-75 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
          <h2 className="text-lg font-bold mb-4">Edit Lead</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="mb-6">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
              <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium hover:bg-gray-300">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}