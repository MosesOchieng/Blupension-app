import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function VerificationNotice() {
  const router = useRouter();
  const { user, isEmailVerified, resendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (isEmailVerified) {
      router.push('/dashboard');
    }
  }, [isEmailVerified, router]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      alert('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/logo.svg"
          alt="BluPension"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your email
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center space-y-4">
            <p className="text-gray-700">
              We've sent a verification email to <strong>{user?.email}</strong>.
              Please check your inbox and click the verification link.
            </p>

            <Button
              onClick={handleResend}
              isLoading={isResending}
              variant="outline"
              className="mt-4"
            >
              Resend Verification Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 