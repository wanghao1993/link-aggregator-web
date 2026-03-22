import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Settings, LogOut, Link2, Heart, Eye, Star, BookmarkIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SignOutButton } from '@/components/auth/SignOutButton';

interface UserStats {
  collectionsCount: number;
  totalViews: number;
  totalLikes: number;
  featuredCount: number;
}

async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // 获取用户的收藏
    const { data: collections } = await supabaseAdmin
      .from('collections')
      .select('views, likes')
      .eq('user_id', userId);

    const collectionsCount = collections?.length || 0;
    const totalViews = collections?.reduce((sum, c) => sum + (c.views || 0), 0) || 0;
    const totalLikes = collections?.reduce((sum, c) => sum + (c.likes || 0), 0) || 0;
    const featuredCount = collections?.filter(c => (c.likes || 0) > 10 || (c.views || 0) > 100).length || 0;

    return {
      collectionsCount,
      totalViews,
      totalLikes,
      featuredCount,
    };
  } catch {
    return {
      collectionsCount: 0,
      totalViews: 0,
      totalLikes: 0,
      featuredCount: 0,
    };
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return String(num);
}

export default async function DashboardPage() {
  const authUser = await getAuthUser();
  const t = await getTranslations('dashboard');

  if (!authUser) {
    redirect('/auth/signin');
  }

  const user = {
    id: authUser.id,
    name: authUser.user_metadata?.name as string | null,
    email: authUser.email ?? null,
    createdAt: authUser.created_at,
  };

  const stats = await getUserStats(user.id);

  return (
    <div className="min-h-screen bg-base">
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
                  <div className="h-12 w-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-lg">
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
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
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
                  <Link href="/create" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    <Link2 className="mr-2 h-4 w-4" />
                    {t('quickActions.createCollection')}
                  </Link>
                  <Link href="/profile/settings" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('quickActions.accountSettings')}
                  </Link>
                  <Link href="/profile/settings" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    <User className="mr-2 h-4 w-4" />
                    {t('quickActions.editProfile')}
                  </Link>
                  <Link href="/import" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    <BookmarkIcon className="mr-2 h-4 w-4" />
                    {t('quickActions.importBookmarks')}
                  </Link>
                  <SignOutButton />
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
                  <div className="flex justify-between items-center p-2 rounded-lg bg-primary/5">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-primary" />
                      {t('stats.myCollections')}
                    </span>
                    <span className="font-bold text-lg">{stats.collectionsCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-blue-500/5">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      {t('stats.totalViews')}
                    </span>
                    <span className="font-bold text-lg">{formatNumber(stats.totalViews)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-red-500/5">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      {t('stats.totalLikes')}
                    </span>
                    <span className="font-bold text-lg">{formatNumber(stats.totalLikes)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-yellow-500/5">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {t('stats.featuredCollections')}
                    </span>
                    <span className="font-bold text-lg">{stats.featuredCount}</span>
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
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>{t('footer.needHelp')} <Link href="/help" className="text-blue-600 hover:underline">{t('footer.contactSupport')}</Link></p>
          <p className="mt-1">{t('footer.lastUpdated')}: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
