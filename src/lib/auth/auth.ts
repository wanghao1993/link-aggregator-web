import NextAuth from 'next-auth';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Email validation schema
const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  verificationCode: z.string().length(6, 'Verification code must be 6 digits').optional()
});

// Initialize Resend for email sending
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send verification email
export async function sendVerificationEmail(email: string, code: string) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
}

// Function to generate verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        verificationCode: { label: 'Verification Code', type: 'text' },
      },
      async authorize(credentials) {
        try {
          const parsed = emailSchema.safeParse(credentials);
          if (!parsed.success) {
            throw new Error(parsed.error.issues[0].message);
          }

          const { email, password, verificationCode } = parsed.data;
          
          // For now, we'll implement the full logic later
          // This is a placeholder for the authorization logic
          return null;
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/signup',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
});