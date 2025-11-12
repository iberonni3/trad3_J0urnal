import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail, updateUserProfile } from '@/lib/supabase/auth';
import { applyUserPreferences } from '@/lib/preferences';

type FontSizeOption = 'small' | 'medium' | 'large';
type AccentColorOption = 'indigo' | 'emerald' | 'trading-gradient';

const fontSizeOptions: { value: FontSizeOption; label: string }[] = [
  { value: 'small', label: 'Compact' },
  { value: 'medium', label: 'Comfortable' },
  { value: 'large', label: 'Large' },
];

const accentColorOptions: { value: AccentColorOption; label: string }[] = [
  { value: 'indigo', label: 'Indigo' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'trading-gradient', label: 'Trading Gradient' },
];

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const metadata = user?.user_metadata ?? {};

  const [displayName, setDisplayName] = useState(metadata.display_name ?? '');
  const [fontSize, setFontSize] = useState<FontSizeOption>(metadata.font_size ?? 'medium');
  const [accentColor, setAccentColor] = useState<AccentColorOption>(metadata.accent_color ?? 'indigo');
  const [tradingGoal, setTradingGoal] = useState(metadata.trading_goal ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    setDisplayName(metadata.display_name ?? '');
    setFontSize(metadata.font_size ?? 'medium');
    setAccentColor(metadata.accent_color ?? 'indigo');
    setTradingGoal(metadata.trading_goal ?? '');
  }, [metadata.display_name, metadata.font_size, metadata.accent_color, metadata.trading_goal]);

  const email = user?.email ?? '';

  const handlePasswordReset = async () => {
    if (!email) return;
    setIsSendingReset(true);
    try {
      const { error } = await sendPasswordResetEmail(email);
      if (error) throw error;
      toast({
        title: 'Password reset sent',
        description: 'Check your inbox for the reset instructions.',
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Password reset failed',
        description: err instanceof Error ? err.message : 'Unable to send reset email.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const saveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { error } = await updateUserProfile({ displayName });
      if (error) throw error;
      await refreshUser();
      toast({ title: 'Profile updated' });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Unable to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const saveTheme = async () => {
    setIsSavingTheme(true);
    try {
      const { error } = await updateUserProfile({ fontSize, accentColor });
      if (error) throw error;
      await refreshUser();
      applyUserPreferences({ font_size: fontSize, accent_color: accentColor });
      toast({ title: 'Appearance updated' });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Unable to update appearance.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTheme(false);
    }
  };

  const saveGoal = async () => {
    setIsSavingGoal(true);
    try {
      const { error } = await updateUserProfile({ tradingGoal });
      if (error) throw error;
      await refreshUser();
      toast({ title: 'Goal saved' });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Unable to update goal.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingGoal(false);
    }
  };

  const initials = useMemo(() => {
    if (displayName) {
      return displayName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase())
        .join('')
        .slice(0, 2);
    }
    return email?.[0]?.toUpperCase() ?? 'U';
  }, [displayName, email]);

  return (
    <div className="content-spacing max-w-5xl">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your TradeJournal profile, appearance preferences, and trading goals.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update the information visible in your navigation bar and shared across the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">Send a reset link to your email inbox.</p>
              </div>
              <Button variant="outline" onClick={handlePasswordReset} disabled={isSendingReset || !email}>
                {isSendingReset ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </div>

            <Button onClick={saveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? 'Saving…' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Pick the font size and accent color that fit your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Font Size</Label>
              <div className="flex gap-2 flex-wrap">
                {fontSizeOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={fontSize === option.value ? 'default' : 'outline'}
                    onClick={() => setFontSize(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2 flex-wrap">
                {accentColorOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={accentColor === option.value ? 'default' : 'outline'}
                    onClick={() => setAccentColor(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={saveTheme} disabled={isSavingTheme}>
              {isSavingTheme ? 'Saving…' : 'Save Appearance'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trading Goal</CardTitle>
            <CardDescription>
              Track your current focus—keep notes on growth targets, discipline reminders, or KPI milestones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Describe the trading goal you're working toward…"
              value={tradingGoal}
              onChange={(event) => setTradingGoal(event.target.value)}
              rows={4}
            />
            <Button onClick={saveGoal} disabled={isSavingGoal}>
              {isSavingGoal ? 'Saving…' : 'Save Goal'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

