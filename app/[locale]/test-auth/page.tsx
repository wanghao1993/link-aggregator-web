import { getServerSession } from 'next-auth';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export default async function TestAuthPage() {
  const session = await getServerSession(auth);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">NextAuth.js 测试页面</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">会话信息</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">API 端点测试</h2>
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
                  GitHub 登录
                </a>
              </li>
              <li>
                <a href="/api/auth/signin/google" className="text-blue-600 hover:underline">
                  Google 登录
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">自定义 API 测试</h2>
            <ul className="space-y-2">
              <li>
                <a href="/api/auth/send-verification" className="text-blue-600 hover:underline">
                  发送验证码 API (POST)
                </a>
              </li>
              <li>
                <a href="/api/auth/register" className="text-blue-600 hover:underline">
                  注册 API (POST)
                </a>
              </li>
              <li>
                <a href="/api/auth/signin" className="text-blue-600 hover:underline">
                  登录 API (POST)
                </a>
              </li>
              <li>
                <a href="/api/auth/dev-oauth/callback?provider=github&code=test" className="text-blue-600 hover:underline">
                  开发 OAuth 回调
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">开发模式说明</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• 电子邮件验证码会在控制台显示</li>
            <li>• OAuth 使用开发模式模拟</li>
            <li>• 数据库使用本地 Supabase 实例</li>
            <li>• 所有 API 端点都已配置完成</li>
          </ul>
        </div>
      </div>
    </div>
  );
}