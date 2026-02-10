import NextAuth from 'next-auth';
import authOptions from './nextauth-config';
import { devResend } from '@/lib/email/dev-resend';

// Function to send verification email
export async function sendVerificationEmail(email: string, code: string) {
  try {
    await devResend.sendVerificationEmail(email, code);
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
}

// Function to send welcome email
export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await devResend.sendWelcomeEmail(email, name);
    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: 'Failed to send welcome email' };
  }
}

// Initialize NextAuth with the configuration
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export const auth = handler.auth;
export const signIn = handler.signIn;
export const signOut = handler.signOut;