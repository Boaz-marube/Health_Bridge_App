// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.createTransporter();
  }

  private async createTransporter() {
    // Use environment variables for email configuration
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    if (!emailUser || !emailPass) {
      console.warn('Email credentials not configured. Using fallback test service.');
      // Fallback to Ethereal for testing
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        }
      });
      console.log('Using test email service. Preview URLs will be shown in console.');
      return;
    }
    
    // Use Gmail SMTP for real email delivery
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    
    console.log(`Mail transporter configured for Gmail: ${emailUser}`);
  }

  async sendPasswordResetCode(to: string, code: string) {
    const mailOptions = {
      from: `Health Bridge Service <${process.env.EMAIL_USER || 'noreply@healthbridge.com'}>`,
      to: to,
      subject: 'Password Reset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3870FF; margin: 0;">Health Bridge</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
              You requested to reset your password. Use the verification code below to proceed:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #3870FF;">
              <h1 style="color: #3870FF; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: monospace;">${code}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This code will expire in 15 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>© 2024 Health Bridge. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Password reset code sent to ${to}`);
      
      // Show preview URL for test emails, message ID for real emails
      if (process.env.EMAIL_USER) {
        console.log('Email sent successfully. Message ID:', info.messageId);
      } else {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
      
      return info;
    } catch (error) {
      console.error('Failed to send email:', error);
      // Don't throw error to prevent breaking the flow
      return null;
    }
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `http://yourapp.com/reset-password?token=${token}`;
    const mailOptions = {
      from: 'Health Bridge Service',
      to: to,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendAppointmentConfirmation(to: string, appointmentDetails: any) {
    const mailOptions = {
      from: 'Health Bridge Service',
      to: to,
      subject: 'Appointment Confirmation',
      html: `<p>Your appointment has been confirmed for ${appointmentDetails.date} at ${appointmentDetails.time}.</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendAppointmentReminder(to: string, appointmentDetails: any) {
    const mailOptions = {
      from: 'Health Bridge Service',
      to: to,
      subject: 'Appointment Reminder',
      html: `<p>Reminder: You have an appointment tomorrow at ${appointmentDetails.time} with Dr. ${appointmentDetails.doctorName}.</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
