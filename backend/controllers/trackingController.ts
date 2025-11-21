
import { Request, Response } from 'express';
import EmailTracking from '../models/EmailTracking';
import Campaign from '../models/Campaign';
import Lead from '../models/Lead';

const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

export const trackEmailOpen = async (req: Request, res: Response) => {
  try {
    const { campaignToken } = req.params;
    const { lead } = req.query;

    res.set({
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.send(TRACKING_PIXEL);

    if (!lead || !campaignToken) {
      return;
    }

    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('User-Agent') || '';
    
    const trackingUpdate = await EmailTracking.findOneAndUpdate(
      { campaignToken, leadId: lead },
      { 
        $inc: { openCount: 1 },
        $set: { 
          status: 'opened',
          openedAt: new Date(),
          ipAddress,
          userAgent,
        }
      },
      { new: true }
    );

    if (trackingUpdate && trackingUpdate.openCount === 1) {
        await Campaign.updateOne(
            { campaignToken },
            { $inc: { openCount: 1 } }
        );
    }

  } catch (error) {
    console.error('Error tracking email open:', error);
  }
};

export const trackLinkClick = async (req: Request, res: Response) => {
  try {
    const { campaignToken } = req.params;
    const { url, lead } = req.query;

    if (!url) {
      return res.status(400).send('Destination URL is required.');
    }

    const decodedUrl = decodeURIComponent(url as string);
    res.redirect(decodedUrl);
    
    if (!lead || !campaignToken) {
        return;
    }
    
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('User-Agent') || '';

    const trackingUpdate = await EmailTracking.findOneAndUpdate(
      { campaignToken, leadId: lead },
      {
        $inc: { clickCount: 1 },
        $set: { 
            status: 'clicked',
            clickedAt: new Date(),
        },
        $push: {
          clickedLinks: {
            url: decodedUrl,
            clickedAt: new Date(),
            ipAddress,
            userAgent,
          },
        },
      },
      { new: true }
    );

    if (trackingUpdate && trackingUpdate.clickCount === 1) {
        await Campaign.updateOne(
            { campaignToken },
            { $inc: { clickCount: 1 } }
        );
    }

  } catch (error) {
    console.error('Track link click error:', error);
    if (!res.headersSent) {
      res.status(500).send('An error occurred during tracking.');
    }
  }
};

export const getTrackingAnalytics = async (req: Request, res: Response) => {
  try {
    const { campaignToken } = req.params;

    const campaign = await Campaign.findOne({ campaignToken });
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const trackingData = await EmailTracking.find({ campaignToken }).populate('leadId', 'name email');

    const summary = {
      totalRecipients: campaign.totalRecipients || 0,
      sent: trackingData.filter(t => t.status !== 'queued' && t.status !== 'failed').length,
      delivered: trackingData.filter(t => ['sent', 'opened', 'clicked'].includes(t.status)).length,
      opened: trackingData.filter(t => t.status === 'opened' || t.status === 'clicked').length,
      clicked: trackingData.filter(t => t.status === 'clicked').length,
      bounced: trackingData.filter(t => t.status === 'bounced').length,
    };

    const rates = {
      openRate: summary.delivered > 0 ? parseFloat(((summary.opened / summary.delivered) * 100).toFixed(2)) : 0,
      clickRate: summary.opened > 0 ? parseFloat(((summary.clicked / summary.opened) * 100).toFixed(2)) : 0,
      bounceRate: summary.sent > 0 ? parseFloat(((summary.bounced / summary.sent) * 100).toFixed(2)) : 0,
    };

    const timeline = trackingData
      .flatMap(t => {
        const events = [];
        if (t.openedAt) {
          events.push({ type: 'open', date: t.openedAt, email: (t.leadId as any)?.email || t.email });
        }
        if (t.clickedLinks && t.clickedLinks.length > 0) {
          t.clickedLinks.forEach(click => {
            events.push({ type: 'click', date: click.clickedAt, email: (t.leadId as any)?.email || t.email, url: click.url });
          });
        }
        return events;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      analytics: {
        campaign: {
          name: campaign.name,
          subject: campaign.subject,
          status: campaign.status,
          sentAt: campaign.sentAt,
        },
        summary,
        rates,
        timeline,
      },
    });

  } catch (error) {
    console.error('Get tracking analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleUnsubscribe = async (req: Request, res: Response) => {
  try {
    const { campaignToken } = req.params;
    const { lead } = req.query;

    if (!lead) {
      return res.status(400).send('<h1>Error</h1><p>Invalid unsubscribe link. Lead identifier is missing.</p>');
    }

    await EmailTracking.findOneAndUpdate(
      { campaignToken, leadId: lead },
      { 
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
      }
    );

    await Lead.findByIdAndUpdate(lead, { status: 'unsubscribed' });

    await Campaign.findOneAndUpdate(
      { campaignToken },
      { $inc: { unsubscribeCount: 1 } }
    );

    res.send('<h1>Unsubscribed</h1><p>You have been successfully unsubscribed from future mailings.</p>');

  } catch (error) {
    console.error('Handle unsubscribe error:', error);
    res.status(500).send('<h1>Error</h1><p>An error occurred while processing your unsubscribe request.</p>');
  }
};