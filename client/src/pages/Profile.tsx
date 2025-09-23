import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Loader2, Copy } from 'lucide-react';

import { getUserProfile } from '@/api/users';
import { referralBaseUrl } from '@/lib/env';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const useProfileParams = () =>
  useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('user_id') ?? params.get('userId') ?? '';
  }, []);

function ProfilePage() {
  const userId = useProfileParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      navigate('/register');
    }
  }, [userId, navigate]);

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: Boolean(userId),
    retry: false,
  });

  const profile = profileQuery.data;

  useEffect(() => {
    if (profileQuery.isError || (profileQuery.isSuccess && !profile)) {
      navigate(`/register?user_id=${encodeURIComponent(userId)}`);
    }
  }, [profileQuery.isError, profileQuery.isSuccess, profile, navigate, userId]);

  if (!userId) {
    return null;
  }

  const handleCopyLink = async () => {
    if (!profile?.user.referralCode) {
      return;
    }
    const link = `${referralBaseUrl ?? window.location.origin}/?ref=${encodeURIComponent(profile.user.referralCode)}`;
    await navigator.clipboard.writeText(link);
    toast({ description: 'Реферальная ссылка скопирована' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Ваш профиль</CardTitle>
          <CardDescription>Сводка активности и баланса в Quadrant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileQuery.isLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Загрузка профиля…
            </div>
          )}

          {profile && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Имя</p>
                <p className="text-lg font-medium">
                  {[profile.user.firstName, profile.user.lastName].filter(Boolean).join(' ') || '—'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-medium">{profile.user.email ?? '—'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Баланс</p>
                  <p className="text-lg font-semibold">{profile.user.tokenBalance ?? '0'} QDR</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Шаги сегодня</p>
                  <p className="text-lg font-semibold">{profile.user.dailySteps ?? 0}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Действий сегодня</p>
                  <p className="text-lg font-semibold">{profile.stats.actionsToday}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground">Награды сегодня</p>
                  <p className="text-lg font-semibold">{profile.stats.rewardsToday}</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm text-muted-foreground">Реферальный код</p>
                  <p className="text-base font-medium">
                    {profile.user.referralCode ?? 'Код будет выдан после регистрации'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCopyLink}
                  disabled={!profile.user.referralCode}
                  className="inline-flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" /> Скопировать
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;
