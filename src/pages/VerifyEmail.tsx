import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase/config';
import { applyActionCode } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (mode === 'verifyEmail' && oobCode) {
          await applyActionCode(auth, oobCode);
          toast({
            title: 'Email verified!',
            description: 'Your email has been successfully verified.',
          });
        }
      } catch (error) {
        toast({
          title: 'Verification failed',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        navigate('/');
      }
    };

    verifyEmail();
  }, [mode, oobCode, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verifying your email...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we verify your email address.</p>
          <Button 
            variant="link" 
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Go to homepage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}