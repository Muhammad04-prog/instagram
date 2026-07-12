import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white text-sm">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
