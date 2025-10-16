import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from "lucide-react";
import { useEmailVerification, useResendVerification } from "@/hooks/useAuth";
import { toast } from "sonner";

interface VerificationState {
  status: 'loading' | 'success' | 'error' | 'expired' | 'invalid' | 'already_verified';
  message: string;
  canResend: boolean;
  resendCooldown: number;
}

export default function EmailVerificationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState<VerificationState>({
    status: 'loading',
    message: 'Verifying your email...',
    canResend: false,
    resendCooldown: 0
  });
  const [userEmail, setUserEmail] = useState<string>('');

  const verifyEmailMutation = useEmailVerification();
  const resendMutation = useResendVerification();

  // Auto-verify on component mount
  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token, {
        onSuccess: (data) => {
          if (data.success) {
            setVerificationState({
              status: 'success',
              message: 'Your email has been verified successfully!',
              canResend: false,
              resendCooldown: 0
            });
          } else {
            setVerificationState({
              status: 'error',
              message: data.message || 'Email verification failed',
              canResend: true,
              resendCooldown: 0
            });
          }
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || error.message;
          let status: VerificationState['status'] = 'error';
          
          if (errorMessage.includes('expired')) {
            status = 'expired';
          } else if (errorMessage.includes('invalid')) {
            status = 'invalid';
          } else if (errorMessage.includes('already verified')) {
            status = 'already_verified';
          }

          setVerificationState({
            status,
            message: errorMessage || 'Email verification failed',
            canResend: status !== 'already_verified',
            resendCooldown: 0
          });
        }
      });
    } else {
      setVerificationState({
        status: 'error',
        message: 'Invalid verification link',
        canResend: false,
        resendCooldown: 0
      });
    }
  }, [token]);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (verificationState.resendCooldown > 0) {
      const timer = setTimeout(() => {
        setVerificationState(prev => ({
          ...prev,
          resendCooldown: prev.resendCooldown - 1
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationState.resendCooldown]);

  const handleResendVerification = () => {
    if (!userEmail) {
      toast.error('Please enter your email address');
      return;
    }

    resendMutation.mutate(userEmail, {
      onSuccess: (data) => {
        if (data.success) {
          setVerificationState(prev => ({
            ...prev,
            canResend: false,
            resendCooldown: data.resendCooldown || 300 // 5 minutes default
          }));
        }
      }
    });
  };

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const getStatusIcon = () => {
    switch (verificationState.status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'already_verified':
        return <CheckCircle className="h-16 w-16 text-blue-500" />;
      default:
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationState.status) {
      case 'success':
      case 'already_verified':
        return 'text-green-600';
      case 'error':
      case 'expired':
      case 'invalid':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl font-bold">
              {verificationState.status === 'loading' && 'Verifying Email...'}
              {verificationState.status === 'success' && 'Email Verified!'}
              {verificationState.status === 'already_verified' && 'Already Verified'}
              {verificationState.status === 'expired' && 'Link Expired'}
              {verificationState.status === 'invalid' && 'Invalid Link'}
              {verificationState.status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription className={`text-base ${getStatusColor()}`}>
              {verificationState.message}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {verificationState.status === 'success' && (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  Welcome to Winbro Training Reels! Your account is now active and ready to use.
                </p>
                <Button 
                  onClick={handleContinueToDashboard}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  Continue to Dashboard
                </Button>
              </div>
            )}

            {verificationState.status === 'already_verified' && (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  Your email is already verified. You can proceed to your dashboard.
                </p>
                <Button 
                  onClick={handleContinueToDashboard}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {(verificationState.status === 'error' || verificationState.status === 'expired' || verificationState.status === 'invalid') && (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  {verificationState.status === 'expired' && 'This verification link has expired. Please request a new one.'}
                  {verificationState.status === 'invalid' && 'This verification link is invalid or has already been used.'}
                  {verificationState.status === 'error' && 'Something went wrong during verification. Please try again.'}
                </p>

                {verificationState.canResend && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          id="email"
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleResendVerification}
                      disabled={resendMutation.isPending || verificationState.resendCooldown > 0 || !userEmail}
                      className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {resendMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : verificationState.resendCooldown > 0 ? (
                        `Resend in ${Math.floor(verificationState.resendCooldown / 60)}:${(verificationState.resendCooldown % 60).toString().padStart(2, '0')}`
                      ) : (
                        'Resend Verification Email'
                      )}
                    </Button>
                  </div>
                )}

                <Button 
                  onClick={handleBackToLogin}
                  variant="outline"
                  className="w-full border-border hover:bg-muted/50 font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            )}

            {verificationState.status === 'loading' && (
              <div className="text-center">
                <p className="text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
