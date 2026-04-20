"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircle, LogOut, Bus, Train, Plane, CarTaxiFront, 
  ChevronDown, Ticket, User, Home
} from 'lucide-react';
import AuthModal from '../ui/AuthModal';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/authApi';

export default function Navbar() {
  const [modalConfig, setModalConfig] = useState({ isOpen: false, view: 'login' });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  
  const pathname = usePathname();
  const { isAuthenticated, user, logout, isAuthModalOpen, setAuthModalOpen } = useAuthStore();

  const openLogin = () => setAuthModalOpen(true);
  const openRegister = () => setAuthModalOpen(true);
  const closeModal = () => setAuthModalOpen(false);

  // Scroll effect for dynamic transparent/solid navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;
    try { await authApi.logout(); }
    catch (error) { console.error("Logout failed", error); } 
    finally { logout(); }
  };

  const navLinks = [
    { name: 'Flights', href: '/', icon: Plane },
    { name: 'Buses', href: '/bus', icon: Bus },
    { name: 'Trains', href: '/train', icon: Train },
    { name: 'Cabs', href: '/taxi', icon: CarTaxiFront },
  ];

  // YouTube Style Mobile Bottom Nav links
  const mobileNavLinks = [
    { name: 'Home', href: '/', icon: Home },
    ...navLinks.filter(l => l.name !== 'Flights'), 
    ...(isAuthenticated ? [{ name: 'My Trips', href: '/trips', icon: Ticket }] : [])
  ];

  return (
    <>
      {/* --- TOP NAVBAR --- */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg border-b border-slate-100 py-0' : 'bg-transparent py-2'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center bg-white shadow-md rounded-xl p-1.5 transition-transform group-hover:scale-105">
                <Image src="/main.png" alt="TRIPneO Logo" width={isScrolled ? 28 : 36} height={isScrolled ? 28 : 36} className="object-contain transition-all" />
              </div>
              <span translate="no" className={`font-black tracking-tight transition-colors ${isScrolled ? 'text-slate-800 text-2xl' : 'text-white text-3xl drop-shadow-md'}`}>
                TRIP<span className="text-emerald-500">neO</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-2 items-center h-full absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link 
                    key={link.name} href={link.href} 
                    className={`flex flex-col items-center justify-center w-20 h-full relative group transition-colors ${isScrolled ? (isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600') : (isActive ? 'text-emerald-400 drop-shadow' : 'text-white/80 hover:text-white')}`}
                  >
                    <link.icon size={22} className={`mb-1 transition-transform group-hover:-translate-y-1 ${isActive ? 'scale-110' : ''}`} />
                    <span className="font-bold text-[11px] uppercase tracking-wide">{link.name}</span>
                    {isActive && isScrolled && <motion.div layoutId="navIndicator" className="absolute bottom-0 left-2 right-2 h-1 bg-emerald-600 rounded-t-full" />}
                  </Link>
                );
              })}
            </div>

            {/* Auth / User Profile */}
            <div className="flex items-center gap-3 ml-auto z-10">
              {isAuthenticated && (
                <Link href="/trips" className={`hidden md:flex items-center gap-2 font-bold text-sm transition-colors ${isScrolled ? 'text-slate-600 hover:text-emerald-600' : 'text-white hover:text-emerald-300 drop-shadow-md'}`}>
                  <Ticket size={18} className={isScrolled ? 'text-emerald-500' : 'text-emerald-400'} />
                  My Trips
                </Link>
              )}

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`flex items-center gap-2 md:gap-3 border transition-all py-1 pl-1 pr-2 rounded-full ${isScrolled ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800' : 'bg-white/20 border-white/30 backdrop-blur-md text-white hover:bg-white/30'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:flex flex-col items-start text-left">
                      <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${isScrolled ? 'text-slate-400' : 'text-emerald-100'}`}>Logged in</span>
                      <span className="text-sm font-black leading-none mt-1 truncate max-w-[100px]">{user?.name || 'Traveler'}</span>
                    </div>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="p-2 space-y-1">
                          <Link href="/profile" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 rounded-xl transition-colors"><User size={18} className="text-slate-400" /> Profile</Link>
                          <div className="h-px bg-slate-100 my-1 mx-2"></div>
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"><LogOut size={18} className="text-red-500" /> Logout</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2 md:gap-3">
                  <button onClick={openLogin} className={`font-bold text-sm transition-colors px-2 ${isScrolled ? 'text-slate-600 hover:text-emerald-600' : 'text-white hover:text-emerald-200 drop-shadow-md'}`}>Login</button>
                  <button onClick={openRegister} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs md:text-sm px-5 py-2 md:py-2.5 rounded-full shadow-lg transition-transform active:scale-95">Sign Up</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- YOUTUBE-STYLE BOTTOM NAVIGATION BAR (Mobile Only) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-50 flex justify-around items-center h-[72px] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.08)] px-1">
        {mobileNavLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link key={link.name} href={link.href} className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-300 ${isActive ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}>
              <div className={`relative flex items-center justify-center w-14 h-8 rounded-full mb-1 transition-all duration-300 ${isActive ? 'bg-emerald-100/80 scale-110' : 'bg-transparent'}`}>
                <link.icon size={22} className={isActive ? 'text-emerald-600 drop-shadow-sm' : 'text-slate-400'} />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>{link.name}</span>
            </Link>
          );
        })}
      </div>

      <AuthModal isOpen={isAuthModalOpen} initialView="login" onClose={closeModal} />
    </>
  );
}
