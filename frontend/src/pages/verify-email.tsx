import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@/components/common/Button';
import { verifyEmail, resendVerification } from '@/utils/auth';

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyEmail(token)
        .then(() => {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
          // Redirect to login after 3 seconds
          setTimeout(() => router.push('/login'), 3000);
        })
        .catch((error) => {
          setStatus('error');
          setMessage(error.message || 'Verification failed. Please try again.');
        });
    }
  }, [token, router]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerification();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessage('Failed to resend verification email. Please try again.');
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
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
            )}

            {status === 'success' && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{message}</div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{message}</div>
                </div>
                <Button
                  onClick={handleResend}
                  isLoading={isResending}
                  variant="outline"
                >
                  Resend Verification Email
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 