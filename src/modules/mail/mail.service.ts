import * as nodemailer from 'nodemailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendVerificationCode(email: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: `"Job Board" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Email Verification Code',
        html: `
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <h1>${code}</h1>
          <p>This code will expire in 10 minutes.</p>
        `,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
