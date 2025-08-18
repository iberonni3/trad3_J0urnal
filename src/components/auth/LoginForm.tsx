import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, EyeOff, Mail } from 'lucide-react';
import { loginWithEmail, loginWithGoogle } from '@/lib/firebase/auth';
import { toast } from '@/components/ui/use-toast';

interface LoginFormProps {
  onToggleForm?: () => void; // optional if not using multi-form
}

export function LoginForm({ onToggleForm }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginWithEmail(email, password);
      toast({
        title: 'Login successful',
        description: 'Welcome back to your trading dashboard!',
      });
      navigate('/dashboard'); // Only navigate after successful login
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: 'Google login successful',
        description: 'Welcome to your trading dashboard!',
      });
      navigate('/dashboard'); // Only after successful login
    } catch (error: any) {
      toast({
        title: 'Google login failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4 sm:mx-0 p-4 sm:p-6 rounded-lg shadow-lg bg-card text-card-foreground mobile-tap-highlight">
      <CardHeader className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 rounded-lg hero-gradient">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">TradeJournal</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Sign in to access your trading dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="trader@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 trading-gradient text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background dark:bg-background-dark px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              Google
            </Button>
          </div>

          {onToggleForm && (
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-primary"
                onClick={onToggleForm}
                disabled={isLoading}
              >
                Sign up
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
  );
}

export default LoginForm;
