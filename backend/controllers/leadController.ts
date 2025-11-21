import { Response } from 'express';
import * as XLSX from 'xlsx';
import pdf from 'pdf-parse';
import { AuthRequest } from '../middleware/auth';
import Lead from '../models/Lead';
import LeadList from '../models/LeadList';

// Smart pattern recognition for emails and names
const extractEmailsAndNames = (text: string): Array<{ email: string; name?: string; company?: string }> => {
  const results: Array<{ email: string; name?: string; company?: string }> = [];
  
  // Email regex pattern
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emails = text.match(emailRegex) || [];
  
  // Name patterns (before email, capitalized words)
  const nameRegex = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?=\s*[:\-,]?\s*[a-zA-Z0-9._-]+@)/g;
  
  // Company patterns (common suffixes)
  const companyRegex = /([A-Z][a-zA-Z0-9\s&]+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co\.|Group|Solutions|Technologies|Tech)\.?)/g;
  
  const lines = text.split('\n');
  
  for (const email of emails) {
    const emailLower = email.toLowerCase();
    let name = '';
    let company = '';
    
    // Find the line containing this email
    for (const line of lines) {
      if (line.toLowerCase().includes(emailLower)) {
        // Try to extract name from the same line
        const nameMatch = line.match(nameRegex);
        if (nameMatch) {
          name = nameMatch[0].trim();
        } else {
          // Try to extract name from email (john.doe@example.com -> John Doe)
          const emailPart = email.split('@')[0];
          const nameParts = emailPart.split(/[._-]/);
          if (nameParts.length >= 2) {
            name = nameParts
              .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
              .join(' ');
          }
        }
        
        // Try to extract company
        const companyMatch = line.match(companyRegex);
        if (companyMatch) {
          company = companyMatch[0].trim();
        } else {
          // Extract company from email domain
          const domain = email.split('@')[1];
          if (domain) {
            const domainParts = domain.split('.');
            if (domainParts.length > 0) {
              company = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
            }
          }
        }
        
        break;
      }
    }
    
    // If no name found, use email username
    if (!name) {
      const emailPart = email.split('@')[0];
      name = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    
    results.push({
      email: emailLower,
      name: name || undefined,
      company: company || undefined
    });
  }
  
  return results;
};

export const uploadCSV = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { listName, listDescription } = req.body;

    if (!listName) {
      return res.status(400).json({ error: 'List name is required' });
    }

    const fileType = req.file.mimetype;
    const fileName = req.file.originalname.toLowerCase();
    let extractedData: Array<{ name: string; email: string; companyName?: string }> = [];

    console.log(`Processing file: ${fileName}, type: ${fileType}`);

    // Handle different file types
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // PDF Processing
      console.log('Processing PDF file...');
      const pdfData = await pdf(req.file.buffer);
      const text = pdfData.text;
      const extracted = extractEmailsAndNames(text);
      
      extractedData = extracted.map(item => ({
        name: item.name || 'Unknown',
        email: item.email,
        companyName: item.company
      }));
      
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel' ||
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      fileName.endsWith('.csv')
    ) {
      // Excel/CSV Processing
      console.log('Processing Excel/CSV file...');
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        return res.status(400).json({ error: 'File is empty' });
      }

      // Smart column detection
      const findKey = (obj: any, possibleKeys: string[]): string | undefined => {
        return Object.keys(obj).find(k => {
          const keyLower = k.toLowerCase().trim();
          return possibleKeys.some(pk => keyLower.includes(pk));
        });
      };

      for (const row of jsonData) {
        // Try multiple possible column names
        const nameKey = findKey(row, ['name', 'full name', 'fullname', 'contact', 'person']);
        const emailKey = findKey(row, ['email', 'e-mail', 'mail', 'email address']);
        const companyKey = findKey(row, ['company', 'organization', 'org', 'business', 'company name']);

        let email = emailKey ? String(row[emailKey]).toLowerCase().trim() : '';
        let name = nameKey ? String(row[nameKey]).trim() : '';
        let company = companyKey ? String(row[companyKey]).trim() : '';

        // If email found but no name, try to extract from email
        if (email && !name) {
          const emailPart = email.split('@')[0];
          const nameParts = emailPart.split(/[._-]/);
          if (nameParts.length >= 2) {
            name = nameParts
              .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
              .join(' ');
          } else {
            name = emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
          }
        }

        // If email found but no company, extract from domain
        if (email && !company) {
          const domain = email.split('@')[1];
          if (domain) {
            const domainParts = domain.split('.');
            if (domainParts.length > 0) {
              company = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
            }
          }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && emailRegex.test(email)) {
          extractedData.push({
            name: name || 'Unknown',
            email: email,
            companyName: company
          });
        }
      }
    } else {
      return res.status(400).json({ 
        error: 'Unsupported file type. Please upload CSV, Excel (.xlsx, .xls), or PDF files.' 
      });
    }

    if (extractedData.length === 0) {
      return res.status(400).json({ 
        error: 'No valid email addresses found in the file. Please check the file content.' 
      });
    }

    console.log(`Extracted ${extractedData.length} leads`);

    // Create new lead list
    const leadList = await LeadList.create({
      userId: req.user._id,
      name: listName,
      description: listDescription || '',
    });

    // Prepare leads for insertion
    const leads = extractedData.map(item => ({
      name: item.name,
      email: item.email,
      companyName: item.companyName || '',
      userId: req.user._id,
      leadListId: leadList._id,
      status: 'active',
    }));

    // Insert leads (skip duplicates)
    let insertedCount = 0;
    let skippedCount = 0;

    for (const lead of leads) {
      try {
        await Lead.create(lead);
        insertedCount++;
      } catch (error: any) {
        if (error.code === 11000) {
          skippedCount++;
        } else {
          throw error;
        }
      }
    }

    if (insertedCount === 0) {
      await LeadList.deleteOne({ _id: leadList._id });
      return res.status(400).json({ 
        error: 'All leads already exist in the database. No new leads were added.' 
      });
    }

    // Update lead list counts
    leadList.totalLeads = insertedCount;
    leadList.activeLeads = insertedCount;
    await leadList.save();

    res.status(201).json({ 
      message: `${insertedCount} leads imported successfully${skippedCount > 0 ? `, ${skippedCount} duplicates skipped` : ''}`,
      leadList: {
        id: leadList._id,
        name: leadList.name,
        totalLeads: leadList.totalLeads
      }
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process file. Please check the file format and try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { listId } = req.query;

    if (listId) {
      // Get leads from specific list
      const leads = await Lead.find({ userId: req.user._id, leadListId: listId });
      res.json({ leads });
    } else {
      // Get all leads
      const leads = await Lead.find({ userId: req.user._id }).populate('leadListId', 'name');
      res.json({ leads });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    const { leadId } = req.params;
    const lead = await Lead.findOneAndDelete({ _id: leadId, userId: req.user._id });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Update lead list counts
    const totalLeads = await Lead.countDocuments({ leadListId: lead.leadListId });
    const activeLeads = await Lead.countDocuments({ leadListId: lead.leadListId, status: 'active' });
    await LeadList.updateOne({ _id: lead.leadListId }, { totalLeads, activeLeads });

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {

      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { leadId } = req.params;
    const { name, email, companyName } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, userId: req.user._id },
      { name, email, companyName },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead updated successfully', lead });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};