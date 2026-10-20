import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const ReferralRedirectPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      const cleanCode = code.trim().toUpperCase();
      localStorage.setItem('soultalk_referral_code', cleanCode);
      navigate(`/register?ref=${cleanCode}`, { replace: true });
    } else {
      navigate('/register', { replace: true });
    }
  }, [code, navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      <p className="mt-4 text-xs font-medium text-stone-600">
        Activating referral treat... redirecting to registration...
      </p>
    </div>
  );
};
