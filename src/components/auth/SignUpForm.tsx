import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, TrendingUp, Mail } from 'lucide-react';
import { signUpWithEmail, signInWithGoogle } from '@/lib/supabase/auth';
import { useToast } from '@/hooks/use-toast';

interface SignUpFormProps {
  onToggleForm: () => void;
}

export function SignUpForm({ onToggleForm }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: 'Error',
        description: 'Please accept the terms and conditions',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUpWithEmail(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      if (error) {
        let errorMessage = 'Signup failed. Please try again.';
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Try signing in.';
        }

        toast({
          title: 'Signup Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success!',
          description: 'Account created successfully! You can now sign in.',
        });
        navigate('/dashboard');
      }

    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: 'Google Signup Failed',
          description: error.message,
          variant: 'destructive',
        });
      }
      // OAuth redirects automatically
    } catch (error: any) {
      toast({
        title: 'Google Signup Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-md sm:mx-0 bg-white/90 backdrop-blur-sm shadow-xl border border-white/20">
      <CardHeader className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 rounded-lg hero-gradient">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">TradeJournal</CardTitle>
        </div>
        <CardDescription className="text-gray-600">
          Create your trading account to get started
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                className="h-11 bg-white/70 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                className="h-11 bg-white/70 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="trader@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              className="h-11 bg-white/70 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password (min 6 characters)</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                minLength={6}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                minLength={6}
                className="h-11 pr-10 bg-white/70 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-1">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              className="mt-1 h-4 w-4 border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80 hover:no-underline">
                Terms & Conditions
              </Button>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full h-11 trading-gradient text-white font-medium hover:opacity-90 transition-opacity"
            disabled={isLoading || !acceptTerms}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* --- Updated Divider Section --- */}
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
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <Mail className="mr-2 h-4 w-4" />
            <span className="text-gray-800">Google</span>
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Button
            variant="link"
            className="p-0 h-auto font-medium text-primary hover:text-primary/80 hover:no-underline"
            onClick={onToggleForm}
            disabled={isLoading}
          >
            Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SignUpForm;
