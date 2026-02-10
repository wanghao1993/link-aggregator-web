// Development mode OAuth simulation
// This allows testing OAuth flows without real API credentials

export interface OAuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  provider: 'github' | 'google';
}

export class DevOAuth {
  private isDevMode: boolean;

  constructor() {
    this.isDevMode = 
      !process.env.GITHUB_CLIENT_ID || 
      process.env.GITHUB_CLIENT_ID.includes('dev') ||
      !process.env.GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID.includes('dev');
  }

  // Simulate OAuth authentication
  async authenticate(provider: 'github' | 'google', code?: string): Promise<OAuthUser> {
    if (!this.isDevMode) {
      throw new Error('Real OAuth authentication not implemented in dev mode');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock user data based on provider
    const mockUsers: Record<'github' | 'google', OAuthUser[]> = {
      github: [
        {
          id: 'github_123456',
          name: 'GitHub Developer',
          email: 'github@example.com',
          image: 'https://avatars.githubusercontent.com/u/123456?v=4',
          provider: 'github'
        },
        {
          id: 'github_789012',
          name: 'Open Source Contributor',
          email: 'contributor@example.com',
          image: 'https://avatars.githubusercontent.com/u/789012?v=4',
          provider: 'github'
        }
      ],
      google: [
        {
          id: 'google_123456',
          name: 'Google User',
          email: 'google@example.com',
          image: 'https://lh3.googleusercontent.com/a/ACg8ocJy-sample-avatar',
          provider: 'google'
        },
        {
          id: 'google_789012',
          name: 'G Suite User',
          email: 'gsuite@example.com',
          image: 'https://lh3.googleusercontent.com/a/ACg8ocJy-another-avatar',
          provider: 'google'
        }
      ]
    };

    // Pick a random user from the provider's mock users
    const users = mockUsers[provider];
    const user = users[Math.floor(Math.random() * users.length)];

    console.log(`🔐 [DEV OAUTH] ${provider.toUpperCase()} authentication successful:`);
    console.log('   User:', user.name);
    console.log('   Email:', user.email);
    console.log('   ID:', user.id);

    return user;
  }

  // Get OAuth authorization URL (for redirect)
  getAuthorizationUrl(provider: 'github' | 'google', redirectUri: string): string {
    if (!this.isDevMode) {
      // In production, this would return the real OAuth URL
      throw new Error('Real OAuth URLs not implemented in dev mode');
    }

    // For development, we'll use a mock URL that simulates the OAuth flow
    const state = Buffer.from(JSON.stringify({
      provider,
      redirectUri,
      timestamp: Date.now()
    })).toString('base64');

    return `/api/auth/dev-oauth/callback?provider=${provider}&state=${state}`;
  }

  // Handle OAuth callback
  async handleCallback(provider: 'github' | 'google', code: string, state: string): Promise<OAuthUser> {
    if (!this.isDevMode) {
      throw new Error('Real OAuth callback not implemented in dev mode');
    }

    // Verify state (in real OAuth, this prevents CSRF attacks)
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      console.log(`🔐 [DEV OAUTH] ${provider.toUpperCase()} callback received:`, stateData);
    } catch (error) {
      console.warn('Invalid state parameter');
    }

    // Simulate exchanging code for access token
    console.log(`🔐 [DEV OAUTH] Exchanging code for ${provider} access token...`);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return mock user
    return this.authenticate(provider, code);
  }

  // Check if we're in development mode
  isDevelopmentMode(): boolean {
    return this.isDevMode;
  }

  // Get development instructions
  getDevelopmentInstructions(): string {
    return `
🎭 OAuth Development Mode Active

For local development, OAuth authentication is simulated:
1. Click GitHub/Google buttons to simulate login
2. Mock user data will be used
3. No real API credentials required

To use real OAuth in production:
1. Create OAuth apps on GitHub and Google
2. Update environment variables:
   - GITHUB_CLIENT_ID
   - GITHUB_CLIENT_SECRET  
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
3. Set callback URLs in your OAuth apps:
   - http://localhost:3000/api/auth/callback/github
   - http://localhost:3000/api/auth/callback/google
    `;
  }
}

// Singleton instance
export const devOAuth = new DevOAuth();