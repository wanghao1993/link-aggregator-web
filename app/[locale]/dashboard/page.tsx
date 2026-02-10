import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Settings, LogOut } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface SessionUser {
  name?: string | null;
  email?: string | null;
}

export default async function DashboardPage() {
  const session = await getServerSession(auth);
  const t = await getTranslations('dashboard');

  // 如果未登录，重定向到登录页面
  if (!session || !session.user) {
    redirect('/auth/signin');
  }

  const user = session.user as SessionUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground">{t('welcome', { name: user.name || user.email || 'User' })}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：用户信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 用户信息卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('profile.title')}
                </CardTitle>
                <CardDescription>{t('profile.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name || t('profile.noName')}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t('profile.memberSince')}</p>
                    <p className="font-medium">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t('profile.lastLogin')}</p>
                    <p className="font-medium">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速操作 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('quickActions.title')}
                </CardTitle>
                <CardDescription>{t('quickActions.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    {t('quickActions.viewCalendar')}
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('quickActions.accountSettings')}
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <User className="mr-2 h-4 w-4" />
                    {t('quickActions.editProfile')}
                  </Button>
                  <Button variant="outline" className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('quickActions.signOut')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：统计信息 */}
          <div className="space-y-6">
            {/* 统计卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>{t('stats.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('stats.activeProjects')}</span>
                    <span className="font-bold">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('stats.completedTasks')}</span>
                    <span className="font-bold">42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('stats.upcomingEvents')}</span>
                    <span className="font-bold">5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 通知 */}
            <Card>
              <CardHeader>
                <CardTitle>{t('notifications.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium">🎉 {t('notifications.welcome')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('notifications.welcomeMessage')}</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm font-medium">✅ {t('notifications.accountVerified')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('notifications.verificationComplete')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 开发模式提示 */}
            {process.env.NODE_ENV === 'development' && (
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <CardHeader>
                  <CardTitle className="text-yellow-800 dark:text-yellow-200">
                    🚧 {t('devMode.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {t('devMode.message')}
                  </p>
                  <div className="mt-3 text-xs space-y-1">
                    <p>📧 {t('devMode.emailSimulation')}</p>
                    <p>🔐 {t('devMode.oauthSimulation')}</p>
                    <p>💾 {t('devMode.localDatabase')}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>{t('footer.needHelp')} <a href="/help" className="text-blue-600 hover:underline">{t('footer.contactSupport')}</a></p>
          <p className="mt-1">{t('footer.lastUpdated')}: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}