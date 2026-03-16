"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Loader2, X, MailCheck, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/lib/store';

export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
  const [view, setView] = useState(initialView);
  const [error, setError] = useState('');
  
  // States to hold credentials for auto-login after OTP success
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  
  // OTP specific states
  const [code, setCode] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  const setAuth = useAuthStore((state) => state.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setError('');
      setCode(Array(6).fill(''));
      setPendingEmail('');
      setPendingPassword('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialView]);

  // OTP Countdown Timer
  useEffect(() => {
    let interval;
    if (view === 'otp' && timer > 0 && !canResend) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend, view]);

  // --- FORM SUBMISSION (LOGIN / REGISTER) ---
  const onSubmit = async (data) => {
    setError('');
    try {
      if (view === 'login') {
        const response = await api.post('/auth/login', { 
          email: data.email, 
          password: data.password 
        });
        
        const displayName = data.email.split('@')[0];
        setAuth({ email: data.email, name: displayName }); 
        handleClose(); 
      } else {
        // Register User
        await api.post('/auth/register', {
          email: data.email,
          password: data.password
        });
        
        // Save credentials temporarily for auto-login later
        setPendingEmail(data.email);
        setPendingPassword(data.password);
        
        // Switch view to OTP without closing the modal
        setView('otp');
        setTimer(30);
        setCanResend(false);
      }
    } catch (err) {
      const backendError = err.response?.data?.error || err.response?.data?.message;
      setError(backendError || `Failed to ${view}. Please try again.`);
    }
  };

  // --- OTP HANDLING FUNCTIONS ---
  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => !isNaN(char))) {
      const newCode = [...code];
      pastedData.forEach((char, i) => { if (i < 6) newCode[i] = char; });
      setCode(newCode);
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = code.join('');
    if (otpString.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // 1. Verify the OTP
      await api.post('/auth/verify-otp', { 
        email: pendingEmail, 
        otp: otpString 
      });
      
      // 2. Auto-Login right after successful verification!
      await api.post('/auth/login', { 
        email: pendingEmail, 
        password: pendingPassword 
      });

      // 3. Update Zustand Store (Changes Navbar automatically)
      const displayName = pendingEmail.split('@')[0];
      setAuth({ email: pendingEmail, name: displayName }); 

      // 4. Close the modal seamlessly
      handleClose();

    } catch (err) {
      const backendError = err.response?.data?.error || err.response?.data?.message;
      setError(backendError || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setCanResend(false);
    setTimer(30);
    setError('');
    try {
      await api.post('/auth/resend-otp', { email: pendingEmail });
    } catch (err) {
      setError('Failed to resend OTP. Please try again later.');
      setCanResend(true);
      setTimer(0);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    setView('login');
    setCode(Array(6).fill(''));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onMouseDown={handleClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="max-w-[420px] w-full bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20 relative"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-5 right-5 z-20 p-2 bg-white/50 backdrop-blur-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all shadow-sm"
            >
              <X size={20} />
            </button>

            {/* Back Button (Only for OTP view) */}
            {view === 'otp' && (
              <button 
                onClick={() => { setView('register'); setError(''); setCode(Array(6).fill('')); }}
                className="absolute top-5 left-5 z-20 p-2 bg-white/50 backdrop-blur-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            {/* Decorative Header Gradient */}
            <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white opacity-90 z-0" />

            <div className="relative px-8 pt-10 pb-8 z-10">
              
              <AnimatePresence mode="wait">
                {/* ---------------- LOGIN / REGISTER VIEW ---------------- */}
                {view !== 'otp' ? (
                  <motion.div key="auth-forms" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    
                    <div className="flex flex-col items-center mb-8">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center mb-4 p-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Image src="/main.png" alt="Logo" width={36} height={36} className="object-contain relative z-10" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {view === 'login' ? 'Welcome back' : 'Join TRIPneO'}
                      </h2>
                      <p className="text-slate-500 text-sm mt-1 text-center px-4">
                        {view === 'login' ? 'Enter your details to access your account.' : 'Start your smart travel journey today.'}
                      </p>
                    </div>

                    <div className="flex p-1 bg-slate-100/80 rounded-2xl mb-8">
                      {['login', 'register'].map((tab) => (
                        <button
                          key={tab} type="button" onClick={() => { setView(tab); reset(); setError(''); }}
                          className={`relative flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors z-10 capitalize tracking-wide ${view === tab ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {view === tab && <motion.div layoutId="authTab" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50" style={{ zIndex: -1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
                          {tab === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                      ))}
                    </div>

                    {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center flex items-center justify-center gap-2">{error}</motion.div>}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {view === 'register' && (
                          <motion.div initial={{ opacity: 0, height: 0, filter: "blur(10px)" }} animate={{ opacity: 1, height: 'auto', filter: "blur(0px)" }} exit={{ opacity: 0, height: 0, filter: "blur(10px)" }} className="overflow-hidden">
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" /></div>
                              <input type="text" {...register('name', { required: view === 'register' ? 'Name is required' : false })} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" placeholder="Full Name" />
                            </div>
                            {errors.name && <span className="text-xs font-bold text-red-500 mt-1.5 pl-2 block">{errors.name.message}</span>}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" /></div>
                          <input type="email" {...register('email', { required: 'Email is required' })} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" placeholder="Email Address" />
                        </div>
                        {errors.email && <span className="text-xs font-bold text-red-500 mt-1.5 pl-2 block">{errors.email.message}</span>}
                      </div>

                      <div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" /></div>
                          <input type="password" {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" placeholder="Password" />
                        </div>
                        {errors.password && <span className="text-xs font-bold text-red-500 mt-1.5 pl-2 block">{errors.password.message}</span>}
                      </div>

                      <AnimatePresence>
                        {view === 'login' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex justify-end pt-1">
                            <a href="#" className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors">Forgot password?</a>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button whileHover={{ scale: 1.01, translateY: -1 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} type="submit" className="w-full flex justify-center items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-70 text-white font-bold text-lg py-3.5 px-4 rounded-2xl shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] transition-all mt-6">
                        {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : (view === 'login' ? 'Sign In' : 'Create Account')}
                      </motion.button>
                    </form>

                    <div className="mt-8">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-semibold text-xs tracking-widest uppercase">Or continue with</span></div>
                      </div>
                      <motion.button whileHover={{ scale: 1.01, translateY: -1 }} whileTap={{ scale: 0.98 }} onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`} type="button" className="mt-6 w-full flex justify-center items-center gap-3 bg-white border-2 border-slate-100 text-slate-700 font-bold py-3.5 px-4 rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm">
                        <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} />
                        Continue with Google
                      </motion.button>
                    </div>
                  </motion.div>

                ) : (
                  
                  /* ---------------- OTP VERIFICATION VIEW ---------------- */
                  <motion.div key="otp-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                    
                    <div className="flex flex-col items-center mb-8 mt-2">
                      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
                        <MailCheck size={32} className="text-emerald-500" />
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center">
                        Verify Email
                      </h2>
                      <p className="text-slate-500 text-center mt-2 text-sm leading-relaxed px-4">
                        We sent a 6-digit code to <br/>
                        <span className="font-bold text-slate-800">{pendingEmail}</span>
                      </p>
                    </div>

                    {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">{error}</motion.div>}

                    <form onSubmit={handleVerifyOtp} className="space-y-8">
                      <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                        {code.map((digit, index) => (
                          <input
                            key={index} ref={(el) => (inputRefs.current[index] = el)} type="text" maxLength={1} value={digit}
                            onChange={(e) => handleOtpChange(e, index)} onKeyDown={(e) => handleOtpKeyDown(e, index)}
                            className="w-12 h-14 text-center text-2xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        ))}
                      </div>

                      <motion.button whileHover={{ scale: 1.01, translateY: -1 }} whileTap={{ scale: 0.98 }} disabled={isVerifying || code.includes('')} type="submit" className="w-full flex justify-center items-center bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-70 text-white font-bold py-4 px-4 rounded-2xl shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] transition-all text-lg">
                        {isVerifying ? <Loader2 className="animate-spin h-6 w-6" /> : 'Verify & Log In'}
                      </motion.button>
                    </form>

                    <div className="mt-8 text-center">
                      <p className="text-sm text-slate-500 font-medium">
                        Didn't receive the code?{' '}
                        {canResend ? (
                          <button onClick={handleResendOtp} type="button" className="text-emerald-600 font-bold hover:text-emerald-500 transition-colors">Resend OTP</button>
                        ) : (
                          <span className="text-slate-400">Resend in <span className="text-slate-700 font-bold">{timer}s</span></span>
                        )}
                      </p>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}