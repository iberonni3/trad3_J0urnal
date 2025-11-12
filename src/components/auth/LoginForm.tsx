import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Eye, EyeOff, Mail } from 'lucide-react';
import { signInWithEmail, sendPasswordResetEmail } from '@/lib/supabase/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onToggleForm?: () => void;
}

export function LoginForm({ onToggleForm }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle OAuth redirect on page load
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      // Check for OAuth callback in URL
      const hash = window.location.hash;
      if (hash.includes('access_token') || hash.includes('error')) {
        try {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (data.session) {
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            toast({
              title: 'Login successful',
              description: 'Welcome back to your trading dashboard!',
            });
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error handling OAuth callback:', error);
          toast({
            title: 'Login failed',
            description: 'There was an error signing in. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        // Normal session check for already logged-in users
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/dashboard');
        }
      }
    };

    handleOAuthRedirect();
  }, [navigate, toast]);

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your account email first.',
        variant: 'destructive',
      });
      return;
    }
    setIsResettingPassword(true);
    try {
      const { error } = await sendPasswordResetEmail(email);
      if (error) {
        toast({
          title: 'Reset failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Reset email sent',
          description: 'Check your inbox for password reset instructions.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Reset failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Login successful',
          description: 'Welcome back to your trading dashboard!',
        });
        navigate('/dashboard');
      }
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
    } catch (error: any) {
      toast({
        title: 'Google login failed',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4 sm:mx-0 bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
      <CardHeader className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 rounded-lg hero-gradient">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">TradeJournal</CardTitle>
        </div>
        <CardDescription className="text-gray-600">
          Sign in to access your trading dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="trader@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 bg-white/70 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 pr-10 bg-white/70 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-xs font-medium text-primary hover:text-primary/80"
                onClick={handlePasswordReset}
                disabled={isLoading || isResettingPassword}
              >
                {isResettingPassword ? 'Sending reset...' : 'Forgot password?'}
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 trading-gradient text-white font-medium hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/90 px-3 text-xs text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Mail className="mr-2 h-4 w-4" />
            <span className="text-gray-800">Google</span>
          </Button>
        </div>

        {onToggleForm && (
          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Button
              variant="link"
              className="p-0 h-auto font-medium text-primary hover:text-primary/80 hover:no-underline"
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
