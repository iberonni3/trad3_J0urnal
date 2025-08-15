import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';

export function VerifyEmailInstructions() {
  const location = useLocation();
  const email = location.state?.email || '';
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white via-purple-200 to-purple-900">
      <div className="w-full max-w-md">
        <Card className="bg-background text-background-foreground shadow-lg">
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We've sent a verification email to <strong>{email}</strong>.</p>
            <p>Please check your inbox and click the verification link to activate your account.</p>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email?
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                // onClick={/* Add resend logic here */}
              >
                Resend Verification Email
              </Button>
            </div>
            
            <Button 
              onClick={() => navigate('/')} 
              className="w-full trading-gradient text-white"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
