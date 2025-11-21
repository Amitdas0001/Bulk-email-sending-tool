'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UploadLeads() {
  const [file, setFile] = useState<File | null>(null);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
      
      // Auto-generate list name from filename if empty
      if (!listName) {
        const fileName = e.target.files[0].name.replace('.csv', '');
        setListName(fileName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    if (!listName.trim()) {
      setError('Please enter a name for this lead list.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('csvFile', file);
    formData.append('listName', listName.trim());
    formData.append('listDescription', listDescription.trim());

    try {
      const response = await fetch(`${API_URL}/api/leads/upload-csv`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message + ` Created list: "${data.leadList.name}"`);
        setFile(null);
        setListName('');
        setListDescription('');
        (document.getElementById('csvFile') as HTMLInputElement).value = '';
      } else {
        setError(data.error || 'Failed to upload file.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Leads</h1>
      <p className="text-gray-600 mb-6 max-w-2xl">
        Upload a file to create a new lead list. Supports <strong>CSV, Excel, and PDF</strong> files.
        Our smart system automatically detects names and emails using pattern recognition - no specific format required!
      </p>

      <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="listName" className="block text-sm font-medium text-gray-700 mb-2">
              Lead List Name *
            </label>
            <input
              type="text"
              id="listName"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="e.g., Q1 2024 Prospects"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="listDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="listDescription"
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value)}
              placeholder="Add notes about this lead list..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 mb-2">
              Upload File *
            </label>
            <input
              type="file"
              id="csvFile"
              name="csvFile"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            <p className="mt-2 text-xs text-gray-500">
              Supported: CSV, Excel (.xlsx, .xls), PDF
            </p>
            <p className="mt-1 text-xs text-gray-400">
              ✨ Smart detection: Automatically finds names and emails
            </p>
          </div>

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

          <button
            type="submit"
            disabled={loading || !file || !listName.trim()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Lead List...' : 'Create Lead List & Upload'}
          </button>
        </form>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl">
        <h3 className="font-semibold text-blue-900 mb-3">✨ Smart Features:</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• <strong>Multi-format support:</strong> CSV, Excel (.xlsx, .xls), PDF</li>
          <li>• <strong>Auto-detection:</strong> Finds emails and names automatically</li>
          <li>• <strong>Pattern recognition:</strong> Extracts data even without headers</li>
          <li>• <strong>Smart naming:</strong> Generates names from email addresses if needed</li>
          <li>• <strong>Company extraction:</strong> Detects company names from domains</li>
          <li>• <strong>Duplicate handling:</strong> Skips existing leads automatically</li>
        </ul>
      </div>

      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6 max-w-2xl">
        <h3 className="font-semibold text-green-900 mb-2">📋 Supported Formats:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
          <div>
            <p className="font-medium">CSV Files</p>
            <p className="text-xs">Comma-separated values</p>
          </div>
          <div>
            <p className="font-medium">Excel Files</p>
            <p className="text-xs">.xlsx, .xls formats</p>
          </div>
          <div>
            <p className="font-medium">PDF Files</p>
            <p className="text-xs">Text-based PDFs</p>
          </div>
        </div>
      </div>
    </div>
  );
}