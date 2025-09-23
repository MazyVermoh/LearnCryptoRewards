import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

import { registerUser, getUserProfile } from '@/api/users';
import { referralBaseUrl } from '@/lib/env';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const useRegistrationParams = () =>
  useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      userId: params.get('user_id') ?? params.get('userId') ?? '',
      referral: params.get('ref') ?? undefined,
    };
  }, []);

function RegistrationPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { userId, referral } = useRegistrationParams();

  const [formState, setFormState] = useState({ email: '', firstName: '', lastName: '' });

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: Boolean(userId),
    retry: false,
  });

  useEffect(() => {
    if (profileQuery.data?.user.email) {
      navigate(`/profile?user_id=${encodeURIComponent(userId)}`);
    }
  }, [profileQuery.data, navigate, userId]);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast({ description: 'Регистрация завершена!' });
      navigate(`/profile?user_id=${encodeURIComponent(userId)}`);
    },
    onError: (error: Error) => {
      toast({
        description: error.message || 'Не удалось зарегистрироваться',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) {
      toast({
        description: 'Не удалось определить пользователя. Откройте Quadrant из Telegram.',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate({
      id: userId,
      email: formState.email,
      firstName: formState.firstName,
      lastName: formState.lastName || undefined,
      referredBy: referral,
    });
  };

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Quadrant</CardTitle>
            <CardDescription>
              Запустите приложение из Telegram-бота Quadrant, чтобы продолжить.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isLoading = profileQuery.isLoading || mutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Регистрация Quadrant</CardTitle>
          <CardDescription>Укажите email и имя, чтобы начать получать награды.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={formState.email}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="name@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="firstName">
                Имя
              </label>
              <Input
                id="firstName"
                required
                value={formState.firstName}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, firstName: event.target.value }))
                }
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="lastName">
                Фамилия (необязательно)
              </label>
              <Input
                id="lastName"
                value={formState.lastName}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, lastName: event.target.value }))
                }
                placeholder="Doe"
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Регистрация…
                </span>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
            {referral && (
              <p className="text-xs text-muted-foreground text-center">
                Вы регистрируетесь по приглашению: {referralBaseUrl}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegistrationPage;
