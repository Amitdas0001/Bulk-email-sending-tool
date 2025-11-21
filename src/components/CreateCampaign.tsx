'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CreateCampaign() {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    htmlContent: '',
  });
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachments(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.htmlContent) {
      setError('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const campaignData = new FormData();
    campaignData.append('name', formData.name);
    campaignData.append('subject', formData.subject);
    campaignData.append('htmlContent', formData.htmlContent);

    if (attachments) {
      for (let i = 0; i < attachments.length; i++) {
        campaignData.append('attachments', attachments[i]);
      }
    }

    try {
      const response = await fetch(`${API_URL}/api/campaigns`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: campaignData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({ name: '', subject: '', htmlContent: '' });
        setAttachments(null);
        
        (document.getElementById('attachments') as HTMLInputElement).value = '';
      } else {
        setError(data.error || 'Failed to create campaign.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Campaign</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Campaign Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Q4 Product Launch"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject Line
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Big News! Our new product is here."
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="htmlContent" className="block text-sm font-medium text-gray-700">
              HTML Content
            </label>
            <textarea
              id="htmlContent"
              name="htmlContent"
              value={formData.htmlContent}
              onChange={handleChange}
              rows={15}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="<html><body><h1>Hi {{name}}!</h1></body></html>"
            />
            <p className="mt-2 text-xs text-gray-500">
              {'Use personalization tokens like &apos;name&apos;, &apos;email&apos;, and &apos;company_name&apos;.'}
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
              Attachments (optional, max 5)
            </label>
            <input
              type="file"
              id="attachments"
              name="attachments"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Campaign'}
          </button>
        </form>
      </div>
    </div>
  );
}