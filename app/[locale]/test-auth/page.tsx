/* eslint-disable @next/next/no-html-link-for-pages */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import authOptions from '@/lib/auth/nextauth-config';
import { getTranslations } from 'next-intl/server';

export default async function TestAuthPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('testAuth');

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('sessionInfo')}</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('apiEndpoints')}</h2>
            <ul className="space-y-2">
              <li>
                <a href="/api/auth/providers" className="text-blue-600 hover:underline">
                  /api/auth/providers
                </a>
              </li>
              <li>
                <a href="/api/auth/session" className="text-blue-600 hover:underline">
                  /api/auth/session
                </a>
              </li>
              <li>
                <a href="/api/auth/signin/github" className="text-blue-600 hover:underline">
                  {t('githubLogin')}
                </a>
              </li>
              <li>
                <a href="/api/auth/signin/google" className="text-blue-600 hover:underline">
                  {t('googleLogin')}
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{t('customApi')}</h2>
            <ul className="space-y-2">
              <li>
                <a href="/api/auth/send-verification" className="text-blue-600 hover:underline">
                  {t('sendVerificationApi')}
                </a>
              </li>
              <li>
                <a href="/api/auth/register" className="text-blue-600 hover:underline">
                  {t('registerApi')}
                </a>
              </li>
              <li>
                <a href="/api/auth/signin" className="text-blue-600 hover:underline">
                  {t('loginApi')}
                </a>
              </li>
              <li>
                <a href="/api/auth/dev-oauth/callback?provider=github&code=test" className="text-blue-600 hover:underline">
                  {t('devOauthCallback')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">{t('devModeTitle')}</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• {t('devModeItems.emailConsole')}</li>
            <li>• {t('devModeItems.oauthSimulation')}</li>
            <li>• {t('devModeItems.localDatabase')}</li>
            <li>• {t('devModeItems.apiReady')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
