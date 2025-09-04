// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'lilla.terry55@ethereal.email',
        pass: 'yQQSg25MR1QwugbNnN',
      },
    });
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
