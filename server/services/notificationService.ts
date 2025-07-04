import { storage } from "../storage";
import { type InsertNotification } from "@shared/schema";
import nodemailer from "nodemailer";

class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });
  }

  async sendTenderMatchNotification(
    userId: string,
    userEmail: string,
    userPhone: string | null,
    tenderTitle: string,
    matchScore: number,
    emailEnabled: boolean,
    smsEnabled: boolean
  ): Promise<void> {
    const subject = `New Tender Match: ${matchScore}% Match Found`;
    const message = `A new tender "${tenderTitle}" matches your business profile with ${matchScore}% compatibility. Check TenderFind SA for details.`;

    // Send email notification
    if (emailEnabled && userEmail) {
      try {
        await this.sendEmailNotification(userId, userEmail, subject, message, tenderTitle);
      } catch (error) {
        console.error("Failed to send email notification:", error);
      }
    }

    // Send SMS notification
    if (smsEnabled && userPhone) {
      try {
        await this.sendSMSNotification(userId, userPhone, message);
      } catch (error) {
        console.error("Failed to send SMS notification:", error);
      }
    }
  }

  private async sendEmailNotification(
    userId: string,
    email: string,
    subject: string,
    message: string,
    tenderTitle: string
  ): Promise<void> {
    const notification: InsertNotification = {
      userId,
      type: "email",
      subject,
      message,
      recipient: email,
      status: "pending",
    };

    const savedNotification = await storage.createNotification(notification);

    try {
      const htmlContent = this.generateEmailHTML(tenderTitle, message);
      
      await this.emailTransporter.sendMail({
        from: process.env.FROM_EMAIL || "noreply@tenderfind.co.za",
        to: email,
        subject,
        text: message,
        html: htmlContent,
      });

      await storage.updateNotificationStatus(savedNotification.id, "sent", new Date());
    } catch (error) {
      await storage.updateNotificationStatus(savedNotification.id, "failed");
      throw error;
    }
  }

  private async sendSMSNotification(
    userId: string,
    phoneNumber: string,
    message: string
  ): Promise<void> {
    const notification: InsertNotification = {
      userId,
      type: "sms",
      message,
      recipient: phoneNumber,
      status: "pending",
    };

    const savedNotification = await storage.createNotification(notification);

    try {
      // Use Twilio for SMS
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error("Twilio credentials not configured");
      }

      const twilio = await import("twilio");
      const client = twilio.default(accountSid, authToken);

      await client.messages.create({
        body: message,
        from: fromNumber,
        to: phoneNumber,
      });

      await storage.updateNotificationStatus(savedNotification.id, "sent", new Date());
    } catch (error) {
      await storage.updateNotificationStatus(savedNotification.id, "failed");
      throw error;
    }
  }

  private generateEmailHTML(tenderTitle: string, message: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TenderFind SA - New Match</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #1B5E20; color: white; padding: 20px; text-align: center; }
        .logo { display: inline-flex; align-items: center; gap: 10px; }
        .logo-icon { width: 32px; height: 32px; background-color: #FFD600; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1B5E20; font-weight: bold; }
        .content { padding: 30px; }
        .tender-card { background-color: #E8F5E8; border-left: 4px solid #2E7D32; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background-color: #1B5E20; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-icon">🔍</div>
                <h1 style="margin: 0; font-size: 24px;">TenderFind SA</h1>
            </div>
        </div>
        
        <div class="content">
            <h2 style="color: #1B5E20;">New Tender Match Found!</h2>
            <p>We found a tender that matches your business profile:</p>
            
            <div class="tender-card">
                <h3 style="margin-top: 0; color: #2E7D32;">${tenderTitle}</h3>
                <p>${message}</p>
            </div>
            
            <p>Don't miss this opportunity! Log in to TenderFind SA to view the full tender details and submit your application.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://tenderfind.co.za'}" class="button">View Tender Details</a>
        </div>
        
        <div class="footer">
            <p>You're receiving this email because you enabled tender match notifications in TenderFind SA.</p>
            <p>To unsubscribe or modify your notification preferences, log in to your account and visit Settings.</p>
            <p>&copy; 2024 TenderFind SA. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  async sendDailyDigest(userId: string, userEmail: string, matches: any[]): Promise<void> {
    if (!matches.length) return;

    const subject = `Daily Tender Digest - ${matches.length} New Matches`;
    const message = `Your daily tender digest contains ${matches.length} new matching opportunities.`;

    const htmlContent = this.generateDigestHTML(matches);

    const notification: InsertNotification = {
      userId,
      type: "email",
      subject,
      message,
      recipient: userEmail,
      status: "pending",
    };

    const savedNotification = await storage.createNotification(notification);

    try {
      await this.emailTransporter.sendMail({
        from: process.env.FROM_EMAIL || "noreply@tenderfind.co.za",
        to: userEmail,
        subject,
        html: htmlContent,
      });

      await storage.updateNotificationStatus(savedNotification.id, "sent", new Date());
    } catch (error) {
      await storage.updateNotificationStatus(savedNotification.id, "failed");
      throw error;
    }
  }

  private generateDigestHTML(matches: any[]): string {
    const matchCards = matches
      .slice(0, 5) // Limit to top 5 matches
      .map(
        (match) => `
        <div style="background-color: #E8F5E8; border-left: 4px solid #2E7D32; padding: 15px; margin: 15px 0; border-radius: 4px;">
            <h4 style="margin-top: 0; color: #2E7D32;">${match.tender.title}</h4>
            <p style="margin: 5px 0; color: #666;">Match Score: ${match.matchScore}%</p>
            <p style="margin: 5px 0; color: #666;">Department: ${match.tender.department}</p>
            <p style="margin: 5px 0; color: #666;">Closing: ${new Date(match.tender.closingDate).toLocaleDateString()}</p>
        </div>
    `
      )
      .join("");

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TenderFind SA - Daily Digest</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #1B5E20; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background-color: #1B5E20; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">TenderFind SA Daily Digest</h1>
        </div>
        
        <div class="content">
            <h2 style="color: #1B5E20;">Your Daily Tender Matches</h2>
            <p>Here are your top tender matches for today:</p>
            
            ${matchCards}
            
            ${matches.length > 5 ? `<p><strong>And ${matches.length - 5} more matches...</strong></p>` : ""}
            
            <a href="${process.env.FRONTEND_URL || 'https://tenderfind.co.za'}" class="button">View All Matches</a>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 TenderFind SA. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }
}

export const notificationService = new NotificationService();
