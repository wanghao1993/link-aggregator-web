import { Resend } from 'resend';

// Development mode Resend wrapper that logs emails instead of sending them
export class DevResend {
  private resend: Resend | null = null;
  private isDevMode: boolean;

  constructor(apiKey?: string) {
    this.isDevMode = !apiKey || apiKey.includes('development') || apiKey.includes('placeholder');
    
    if (!this.isDevMode && apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  async sendEmail(params: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    const { from, to, subject, html, text } = params;

    if (this.isDevMode) {
      // Log email to console in development mode
      console.log('📧 [DEV MODE] Email would be sent:');
      console.log('   From:', from);
      console.log('   To:', to);
      console.log('   Subject:', subject);
      console.log('   HTML Preview:', html.substring(0, 200) + '...');
      
      if (text) {
        console.log('   Text Preview:', text.substring(0, 200) + '...');
      }

      // Extract verification code from HTML for easier testing
      const codeMatch = html.match(/\b\d{6}\b/);
      if (codeMatch) {
        console.log('   🔑 Verification Code:', codeMatch[0]);
      }

      // Simulate successful send
      return {
        id: 'dev-' + Date.now(),
        from,
        to: [to],
        subject,
        html,
        text: text || '',
        created_at: new Date().toISOString(),
      };
    }

    // Real Resend API call
    if (!this.resend) {
      throw new Error('Resend not initialized. Check your API key.');
    }

    return this.resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p style="color: #666;">Thank you for signing up! Please use the following verification code to complete your registration:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this verification, please ignore this email.</p>
      </div>
    `;

    const text = `Verify Your Email Address\n\nThank you for signing up! Please use the following verification code to complete your registration:\n\n${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this verification, please ignore this email.`;

    return this.sendEmail({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'Verify your email address - LinkHub',
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to LinkHub, ${name}! 🎉</h2>
        <p style="color: #666;">Your account has been successfully created and verified.</p>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; color: white; text-align: center; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">Ready to discover amazing links?</h3>
          <p style="margin: 0;">Start exploring curated collections from the community!</p>
        </div>
        <p style="color: #666;">You can now:</p>
        <ul style="color: #666;">
          <li>Browse and search link collections</li>
          <li>Save your favorite collections</li>
          <li>Create your own collections</li>
          <li>Connect with other users</li>
        </ul>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">Happy exploring!<br>The LinkHub Team</p>
      </div>
    `;

    const text = `Welcome to LinkHub, ${name}!\n\nYour account has been successfully created and verified.\n\nReady to discover amazing links? Start exploring curated collections from the community!\n\nYou can now:\n- Browse and search link collections\n- Save your favorite collections\n- Create your own collections\n- Connect with other users\n\nHappy exploring!\nThe LinkHub Team`;

    return this.sendEmail({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: `Welcome to LinkHub, ${name}!`,
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, resetLink: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #666;">We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
      </div>
    `;

    const text = `Reset Your Password\n\nWe received a request to reset your password. Use the link below to create a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request a password reset, please ignore this email.`;

    return this.sendEmail({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'Reset your password - LinkHub',
      html,
      text,
    });
  }
}

// Singleton instance
export const devResend = new DevResend(process.env.RESEND_API_KEY);