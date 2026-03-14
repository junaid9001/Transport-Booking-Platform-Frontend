"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  UserCircle, 
  LogOut, 
  Bus, 
  Train, 
  Plane, 
  Car 
} from 'lucide-react';
import AuthModal from '../ui/AuthModal';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/axios';

export default function Navbar() {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, view: 'login' });
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { isAuthenticated, user, logout } = useAuthStore();

  const openLogin = () => setModalConfig({ isOpen: true, view: 'login' });
  const openRegister = () => setModalConfig({ isOpen: true, view: 'register' });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    
    if (!confirmLogout) return;

    try {
      await api.post('/auth/logout'); 
      
      window.alert("You have been successfully logged out!");
      
    } catch (error) {
      console.error("Logout failed", error);
      window.alert("An error occurred while logging out.");
    } finally {
      logout(); 
    }
  };
  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      // If user scrolls down more than 20px, set isScrolled to true
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Buses', href: '/bus', icon: Bus },
    { name: 'Trains', href: '/train', icon: Train },
    { name: 'Flights', href: '/flight', icon: Plane },
    { name: 'Taxis', href: '/taxi', icon: Car },
  ];

  

  return (
    <>
      <nav 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out border-b
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-2xl shadow-md border-emerald-100/50' 
          : 'bg-white/80 backdrop-blur-xl border-emerald-100 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.15)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Height transitions from h-24 (96px) to h-16 (64px) on scroll */}
          <div className={`flex justify-between items-center transition-all duration-300 ease-in-out ${isScrolled ? 'h-16' : 'h-24'}`}>
            
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ rotate: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`relative flex items-center justify-center bg-emerald-50 rounded-2xl border border-emerald-100/50 shadow-sm transition-all duration-300
                  ${isScrolled ? 'p-0.5' : 'p-1'}
                `}
              >
                <Image
                  src="/main.png" 
                  alt="TRIPneO Logo" 
                  width={isScrolled ? 32 : 46} 
                  height={isScrolled ? 32 : 46} 
                  priority
                  className="object-contain drop-shadow-md transition-all duration-300"
                />
              </motion.div>
              <div className="flex flex-col justify-center overflow-hidden">
                <span className={`font-black bg-gradient-to-br from-emerald-600 to-teal-400 bg-clip-text text-transparent tracking-tight leading-none transition-all duration-300
                  ${isScrolled ? 'text-xl' : 'text-2xl'}
                `}>
                  TRIPneO
                </span>
                {/* Hide tagline smoothly on scroll */}
                <span className={`text-[10px] font-bold text-slate-400 tracking-widest uppercase transition-all duration-300 origin-left
                  ${isScrolled ? 'h-0 opacity-0 scale-y-0 mt-0' : 'h-auto opacity-100 scale-y-100 mt-0.5'}
                `}>
                  Travel Smart
                </span>
              </div>
            </Link>

            {/* Desktop Menu - Icons Above Text */}
            <div className="hidden md:flex space-x-6 items-center h-full">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={`relative flex flex-col items-center justify-center transition-all duration-300 group w-20 rounded-2xl hover:bg-emerald-50/80
                    ${isScrolled ? 'gap-0.5 py-1' : 'gap-1.5 py-2'}
                  `}
                >
                  <link.icon 
                    size={isScrolled ? 18 : 24} 
                    className="text-slate-400 group-hover:text-emerald-500 group-hover:-translate-y-1 transition-all duration-300" 
                  />
                  <span className={`font-extrabold text-slate-500 group-hover:text-emerald-600 transition-colors uppercase tracking-wide
                    ${isScrolled ? 'text-[9px]' : 'text-[11px]'}
                  `}>
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>

            {/* Auth / User Section */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                // Logged In State
                <div className="flex items-center gap-3">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden sm:flex flex-col items-end mr-1"
                  >
                    {!isScrolled && <span className="text-[11px] text-slate-400 font-medium leading-none mb-1">Welcome back,</span>}
                    <span className="text-sm font-bold text-emerald-700 leading-none">{user?.name || 'Traveler'}</span>
                  </motion.div>
                  
                  <div className={`rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm cursor-pointer hover:bg-emerald-200 transition-all duration-300
                    ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'}
                  `}>
                    <UserCircle size={isScrolled ? 20 : 24} />
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className={`flex items-center justify-center bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-full transition-all shadow-sm
                      ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'}
                    `}
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </motion.button>
                </div>
              ) : (
                // Logged Out State
                <div className="flex items-center gap-3">
                  <button 
                    onClick={openLogin} 
                    className={`text-slate-600 font-bold hover:bg-slate-50 hover:text-emerald-600 transition-all rounded-full
                      ${isScrolled ? 'text-xs px-4 py-2' : 'text-sm px-5 py-2.5'}
                    `}
                  >
                    Log in
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openRegister}
                    className={`bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/25 transition-all rounded-full
                      ${isScrolled ? 'text-xs px-5 py-2' : 'text-sm px-7 py-2.5'}
                    `}
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Render the Modal here */}
      <AuthModal 
        isOpen={modalConfig.isOpen} 
        initialView={modalConfig.view} 
        onClose={closeModal} 
      />
    </>
  );
}