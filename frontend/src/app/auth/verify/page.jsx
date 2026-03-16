"use client";
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/axios';

// Create a separate component for the actual form that uses searchParams
function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get('email') || 'your email';

  const [code, setCode] = useState(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return; 

    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => !isNaN(char))) {
      const newCode = [...code];
      pastedData.forEach((char, i) => {
        if (i < 6) newCode[i] = char;
      });
      setCode(newCode);
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = code.join('');
    
    if (otpString.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/verify-email', { 
        email: emailParam !== 'your email' ? emailParam : undefined, 
        otp: otpString 
      });
      router.push('/?verified=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimer(30);
    setError('');
    
    try {
      await api.post('/auth/resend-otp', { email: emailParam });
    } catch (err) {
      setError('Failed to resend OTP. Please try again later.');
      setCanResend(true);
      setTimer(0);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
      className="max-w-lg w-full bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden border border-white relative z-10 p-8 sm:p-12"
    >
      <button 
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
          <MailCheck size={36} className="text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center">
          Check your email
        </h2>
        <p className="text-slate-500 text-center mt-3 text-base leading-relaxed px-4">
          We've sent a 6-digit verification code to <br/>
          <span className="font-bold text-slate-900">{emailParam}</span>
        </p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 text-center"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleVerify} className="space-y-10">
        
        {/* OTP Input Boxes */}
        <div className="flex justify-between gap-2 sm:gap-4" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 sm:w-16 sm:h-16 text-center text-3xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          ))}
        </div>

        <motion.button 
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading || code.includes('')}
          type="submit" 
          className="w-full flex justify-center items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-300 disabled:to-emerald-300 disabled:shadow-none disabled:transform-none text-white font-bold text-lg py-4 px-4 rounded-2xl shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] transition-all"
        >
          {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Verify Email'}
        </motion.button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-slate-500 font-medium">
          Didn't receive the code?{' '}
          {canResend ? (
            <button 
              onClick={handleResend}
              className="text-emerald-600 font-bold hover:text-emerald-500 transition-colors ml-1"
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-slate-400 ml-1">Resend in <span className="text-slate-700 font-bold">{timer}s</span></span>
          )}
        </p>
      </div>

    </motion.div>
  );
}

// Main Page Wrapper with Suspense
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-emerald-200 blur-[120px] opacity-40 mix-blend-multiply pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-teal-200 blur-[120px] opacity-40 mix-blend-multiply pointer-events-none"></div>

      {/* Wrapping in Suspense to support useSearchParams in Next.js 13+ */}
      <Suspense fallback={
        <div className="flex flex-col items-center z-10 text-emerald-600">
          <Loader2 className="animate-spin h-10 w-10 mb-4" />
          <p className="font-bold text-slate-500">Loading secure environment...</p>
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}