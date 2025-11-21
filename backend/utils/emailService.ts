import nodemailer from 'nodemailer';
import { ILead } from '../models/Lead';
import { ICampaign } from '../models/Campaign';
import { IUser } from '../models/User';
import EmailTracking from '../models/EmailTracking';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private async createTransporter(user: IUser) {
    if (!user.smtp || !user.smtp.host || !user.smtp.user || !user.smtp.pass) {
      throw new Error('SMTP settings are not configured for this user.');
    }

    this.transporter = nodemailer.createTransport({
      host: user.smtp.host,
      port: user.smtp.port || 587,
      secure: (user.smtp.port || 587) === 465,
      auth: {
        user: user.smtp.user,
        pass: user.smtp.pass,
      },
      tls: {
          rejectUnauthorized: false
      }
    });

    await this.transporter.verify();
  }

  public async sendBulkEmails(campaign: ICampaign, leads: ILead[], user: IUser) {
    try {
      await this.createTransporter(user);
      
      if (!this.transporter) {
        throw new Error("Email transporter could not be initialized.");
      }

      console.log(`Starting bulk email send for campaign: ${campaign.name}`);
      console.log(`Total recipients: ${leads.length}`);
      
      let sentCount = 0;
      let failedCount = 0;

      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        console.log(`Sending ${i + 1}/${leads.length} to ${lead.email}`);
        
        const mailOptions = this.prepareMailOptions(campaign, lead, user);

        try {
          await this.transporter.sendMail(mailOptions);
          sentCount++;
          
          await EmailTracking.updateOne(
            { campaignToken: campaign.campaignToken, leadId: lead._id.toString() },
            { $set: { status: 'sent', sentAt: new Date() } }
          );
          
          // Update campaign stats
          await campaign.updateOne({ sentCount });
          
          console.log(`✅ Sent to ${lead.email}`);
        } catch (error) {
          failedCount++;
          console.error(`❌ Failed to send to ${lead.email}:`, (error as Error).message);
          
          await EmailTracking.updateOne(
            { campaignToken: campaign.campaignToken, leadId: lead._id.toString() },
            { $set: { status: 'failed', failureReason: (error as Error).message } }
          );
          
          // Update campaign stats
          await campaign.updateOne({ failedCount });
        }
        
        // Rate limiting: 3 seconds between emails (20 per minute)
        if (i < leads.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      console.log(`✅ Finished campaign: ${campaign.name}`);
      console.log(`   Sent: ${sentCount}, Failed: ${failedCount}`);
      
      // Final update
      campaign.status = 'sent';
      campaign.sentAt = new Date();
      campaign.sentCount = sentCount;
      campaign.failedCount = failedCount;
      await campaign.save();

    } catch (error) {
      console.error('Error in sendBulkEmails:', error);
      campaign.status = 'draft';
      await campaign.save();
      throw error; 
    }
  }
  
  private prepareMailOptions(campaign: ICampaign, lead: ILead, user: IUser) {
    const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
    
    const trackingPixelUrl = `${backendUrl}/api/track/open/${campaign.campaignToken}?lead=${lead._id.toString()}`;
    const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" alt="" />`;

    let personalizedHtml = campaign.htmlContent
      .replace(/{{name}}/g, lead.name)
      .replace(/{{email}}/g, lead.email)
      .replace(/{{company_name}}/g, lead.companyName || '');
    
    personalizedHtml += trackingPixel;

    personalizedHtml = personalizedHtml.replace(/href="([^"]+)"/g, (match, url) => {
        if (url.startsWith('http')) {
            const encodedUrl = encodeURIComponent(url);
            const trackingUrl = `${backendUrl}/api/track/click/${campaign.campaignToken}?lead=${lead._id.toString()}&url=${encodedUrl}`;
            return `href="${trackingUrl}"`;
        }
        return match;
    });

    return {
      from: `"${user.firstName} ${user.lastName}" <${user.smtp?.user}>`,
      to: lead.email,
      subject: campaign.subject,
      html: personalizedHtml,
      attachments: campaign.attachments,
    };
  }
}

export default new EmailService();