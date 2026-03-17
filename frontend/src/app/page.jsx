"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, Train, Plane, CarTaxiFront, Sparkles, ShieldCheck, Zap, 
  MapPin, Calendar, ArrowRightLeft, Search, Facebook, Twitter, 
  Instagram, Linkedin, Mail, PhoneCall, Bot, QrCode, MessageCircle, 
  CheckCheck, Send, Percent, ChevronDown, Users, Clock,
  MapPin as MapPinIcon, MoreVertical, Battery, Wifi, Signal
} from 'lucide-react';

const services = [
  { name: 'Flights', icon: Plane, id: 'flight' },
  { name: 'Buses', icon: Bus, id: 'bus' },
  { name: 'Trains', icon: Train, id: 'train' },
  { name: 'Cabs', icon: CarTaxiFront, id: 'taxi' },
];

const backgroundImages = [ "/images/Flight.png", "/images/Taxi.avif", "/images/train.avif", "/images/Bus.avif" ];

const offers = [
  { title: 'Flat 15% Off on Domestic Flights', code: 'TRIPFLY15', category: 'Flights', img: "/images/offers/flightoffer.png" },
  { title: 'Save ₹500 on First Bus Booking', code: 'NEWBUS500', category: 'Buses', img: "/images/offers/Bus.avif" },
  { title: 'Free Taxi Upgrades to Sedan', code: 'PREMIUMRIDE', category: 'Cabs', img: "/images/offers/taxioffer.avif" },
];

const destinations = [
  { name: 'Munnar, Kerala', tours: '120+ options', img: "/images/destinations/munnar.jpg" },
  { name: 'Goa Beaches', tours: '85+ options', img: "/images/destinations/goa.jpg" },
  { name: 'Manali Mountains', tours: '90+ options', img: "/images/destinations/manali.avif" },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('flight');
  const [fromLocation, setFromLocation] = useState('Kochi');
  const [toLocation, setToLocation] = useState('Bangalore');
  const [currentBg, setCurrentBg] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // --- INTERACTIVE CHATBOT STATE ---
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi there! 👋 I am TRIPneO AI. Where would you like to travel today?', type: 'text', time: '10:41 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const chatContainerRef = useRef(null); // Changed to container ref

  // Screen resize & Background interval
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); 
    window.addEventListener('resize', handleResize);
    const timer = setInterval(() => setCurrentBg((prev) => (prev + 1) % backgroundImages.length), 6000);
    return () => { clearInterval(timer); window.removeEventListener('resize', handleResize); };
  }, []);

  // FIX: Scroll ONLY the chat container, not the whole page!
  useEffect(() => {
    if (chatContainerRef.current && (chatMessages.length > 1 || isBotTyping)) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages, isBotTyping]);

  const handleSwap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  // --- INTERACTIVE CHATBOT LOGIC ---
  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    setChatMessages(prev => [...prev, { id: Date.now(), sender: 'user', text, type: 'text', time: currentTime }]);
    setChatInput('');
    setShowQuickReplies(false);
    setShowActionButtons(false);
    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);
      const lowerText = text.toLowerCase();
      const botTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
      
      if (lowerText.includes('kochi to bangalore') || lowerText.includes('bus')) {
        setChatMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'I found great sleeper buses for you! 🚌', type: 'text', time: botTime }]);
        setShowActionButtons(true);
      } 
      else if (lowerText.includes('₹850') || lowerText.includes('₹950')) {
        setChatMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'Awesome! Generating your ticket...', type: 'text', time: botTime }]);
        setIsBotTyping(true);
        setTimeout(() => {
          setIsBotTyping(false);
          const ticketTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
          setChatMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'Ticket Confirmed! 🎉', type: 'ticket', time: ticketTime }]);
        }, 1200);
      } 
      else {
        setChatMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: "I can help with that! Let me fetch the best routes and prices for you in a moment.", type: 'text', time: botTime }]);
        setTimeout(() => setShowQuickReplies(true), 2000);
      }
    }, 1500);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20 md:pb-0 selection:bg-emerald-500 selection:text-white">
      
      {/* --- HERO SECTION --- */}
      <div className="relative pt-24 pb-32 md:pt-36 md:pb-56 flex flex-col justify-center items-center">
        
        {/* Crossfade Backgrounds */}
        <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.img 
              key={currentBg} src={backgroundImages[currentBg]}
              initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-50"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 md:mb-16">
            <h1 className="text-4xl md:text-[5rem] md:leading-tight font-black text-white tracking-tight drop-shadow-2xl">
              India's <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Smartest</span> Travel.
            </h1>
            <p className="hidden md:block text-xl md:text-2xl text-slate-200 mt-4 max-w-3xl mx-auto font-medium drop-shadow-md">
              AI-powered bookings. Zero hidden fees. Unforgettable journeys.
            </p>
          </motion.div>

          {/* --- REDESIGNED SEARCH WIDGET --- */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring' }}
            className="w-full max-w-6xl mx-auto relative bg-white/20 backdrop-blur-xl border border-white/30 p-2 md:p-3 rounded-3xl md:rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
          >
            <div className="bg-white rounded-[1.25rem] md:rounded-[2rem] shadow-inner p-4 md:p-6 pb-14 md:pb-8 relative">
              
              {/* Tabs */}
              <div className="flex justify-center md:justify-start mb-4 md:mb-6">
                <div className="flex overflow-x-auto w-full md:w-auto gap-1 md:gap-2 bg-slate-50 p-1.5 rounded-xl md:rounded-full border border-slate-100 hide-scrollbar shadow-inner">
                  {services.map((service) => {
                    const isActive = activeTab === service.id;
                    return (
                      <button key={service.id} onClick={() => setActiveTab(service.id)} className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 py-3 px-4 md:px-8 rounded-lg md:rounded-full font-black transition-all text-xs md:text-sm uppercase tracking-wide whitespace-nowrap ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transform scale-105' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <service.icon size={isMobile ? 14 : 18} className={isActive ? 'text-emerald-100' : 'text-slate-400'} /> {service.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid Inputs */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-0 md:divide-x divide-slate-200 border border-slate-200 rounded-xl md:rounded-2xl bg-slate-50 md:bg-white overflow-hidden">
                
                <div className="flex flex-col md:flex-row flex-[2] relative">
                  <div className="flex-1 p-3 md:p-6 hover:bg-slate-50 cursor-text transition-colors border-b md:border-b-0 group">
                    <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-600">From</span>
                    <input type="text" value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} className="w-full text-xl md:text-3xl font-black text-slate-900 bg-transparent focus:outline-none truncate mt-0.5" />
                    <p className="text-[10px] md:text-sm text-slate-500 truncate mt-1">Cochin Intl Airport</p>
                  </div>

                  <button onClick={handleSwap} className="absolute right-4 top-[50%] -translate-y-1/2 md:left-1/2 md:right-auto md:-translate-x-1/2 z-10 w-10 h-10 md:w-14 md:h-14 bg-white border border-slate-200 rounded-full flex items-center justify-center text-emerald-600 shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:bg-emerald-50 transition-all hover:scale-110 active:scale-95">
                    <ArrowRightLeft size={isMobile ? 16 : 20} className="rotate-90 md:rotate-0" />
                  </button>

                  <div className="flex-1 p-3 md:p-6 hover:bg-slate-50 cursor-text transition-colors group pl-4 md:pl-8">
                    <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-600">To</span>
                    <input type="text" value={toLocation} onChange={(e) => setToLocation(e.target.value)} className="w-full text-xl md:text-3xl font-black text-slate-900 bg-transparent focus:outline-none truncate mt-0.5" />
                    <p className="text-[10px] md:text-sm text-slate-500 truncate mt-1">Kempegowda Intl</p>
                  </div>
                </div>

                <div className="flex-[2] flex flex-row divide-x divide-slate-200 border-t md:border-t-0 border-slate-200">
                  <div className="flex-1 p-3 md:p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                    <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-emerald-600"><Calendar size={isMobile ? 10 : 14}/> Departs</span>
                    <h3 className="text-lg md:text-3xl font-black text-slate-900 mt-1">15 <span className="text-sm md:text-xl font-bold">Mar</span></h3>
                    <p className="text-[10px] md:text-sm text-slate-500 mt-1">Sunday '26</p>
                  </div>

                  {activeTab === 'flight' && (
                    <div className="flex-1 p-3 md:p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between group-hover:text-emerald-600">Traveler <ChevronDown size={isMobile ? 10 : 14}/></span>
                      <h3 className="text-lg md:text-3xl font-black text-slate-900 mt-1">1 <span className="text-sm md:text-xl font-bold">Adult</span></h3>
                      <p className="text-[10px] md:text-sm text-emerald-600 font-bold truncate mt-1">Economy</p>
                    </div>
                  )}
                  {activeTab === 'train' && (
                    <div className="flex-1 p-3 md:p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between group-hover:text-emerald-600">Class <ChevronDown size={isMobile ? 10 : 14}/></span>
                      <h3 className="text-lg md:text-3xl font-black text-slate-900 mt-1 truncate">3A</h3>
                      <p className="text-[10px] md:text-sm text-emerald-600 font-bold truncate mt-1">AC 3-Tier</p>
                    </div>
                  )}
                  {activeTab === 'bus' && (
                    <div className="flex-1 p-3 md:p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between group-hover:text-emerald-600">Bus <ChevronDown size={isMobile ? 10 : 14}/></span>
                      <h3 className="text-lg md:text-3xl font-black text-slate-900 mt-1 truncate">Sleep</h3>
                      <p className="text-[10px] md:text-sm text-emerald-600 font-bold truncate mt-1">AC / Non-AC</p>
                    </div>
                  )}
                  {activeTab === 'taxi' && (
                    <div className="flex-1 p-3 md:p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between group-hover:text-emerald-600"><Clock size={isMobile ? 10 : 14}/> Time</span>
                      <h3 className="text-lg md:text-3xl font-black text-slate-900 mt-1">10 <span className="text-sm md:text-xl font-bold">AM</span></h3>
                      <p className="text-[10px] md:text-sm text-emerald-600 font-bold truncate mt-1">Sedan/SUV</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Search Button */}
              <div className="absolute -bottom-6 md:-bottom-9 left-1/2 -translate-x-1/2 z-20 w-[90%] md:w-auto">
                <button className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black text-lg md:text-2xl px-6 md:px-24 py-4 md:py-5 rounded-xl md:rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95 flex justify-center items-center gap-3 uppercase tracking-widest md:border-[6px] border-white group">
                  <Search size={isMobile ? 20 : 28} strokeWidth={3} className="text-emerald-400 group-hover:rotate-12 transition-transform" /> Search
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- TRENDING OFFERS --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Percent size={28} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Trending Offers</h2>
              <p className="text-slate-500 font-medium mt-1">Grab these deals before they vanish!</p>
            </div>
          </div>
          <button className="hidden md:block text-emerald-600 font-bold hover:text-emerald-700 transition-colors">View All Deals →</button>
        </div>

        {/* FIX: Removed buggy 3D perspective, changed to clean floating cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {offers.map((offer, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -8, zIndex: 10 }}
              className="relative rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl h-56 md:h-64 cursor-pointer group bg-slate-900 transition-all duration-300"
            >
              <img src={offer.img} alt={offer.title} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent p-6 md:p-8 flex flex-col justify-end">
                <span className="absolute top-5 left-5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                  {offer.category}
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white mb-4 leading-tight drop-shadow-md">{offer.title}</h3>
                <div className="flex items-center justify-between border-t border-white/20 pt-4">
                  <span className="text-white/80 text-xs font-bold uppercase tracking-widest">Use Code</span>
                  <span className="inline-block px-4 py-1.5 bg-emerald-500 text-white border border-emerald-400 rounded-xl text-sm font-black shadow-lg">
                    {offer.code}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- WHATSAPP AI CHATBOT PREVIEW (Fully Interactive Demo) --- */}
      <div className="bg-slate-950 py-20 md:py-32 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[150px] opacity-20 pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500 rounded-full blur-[150px] opacity-20 pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-16 shadow-2xl relative flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-16">
            
            <div className="lg:w-1/2 text-white text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs md:text-sm mb-6 shadow-inner">
                <Sparkles size={16} /> <span>Try Our Interactive AI Demo</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black leading-tight mb-6 tracking-tight">
                Book instantly via <br className="hidden md:block"/><span className="text-[#25D366]">WhatsApp.</span>
              </h2>
              <p className="text-slate-400 text-base md:text-xl mb-10 leading-relaxed font-medium">
                Try it right now! Click a quick reply or type a destination in the phone screen to see how our Agentic AI processes your booking in seconds.
              </p>
              
              <ul className="space-y-4 mb-10 text-left max-w-sm mx-auto lg:mx-0">
                {['Conversational Routing', 'Secure UPI Payments', 'QR Tickets via Chat'].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-slate-200 font-medium text-base md:text-lg">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-400 border border-white/10"><CheckCheck size={16} /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* --- INTERACTIVE PHONE MOCKUP --- */}
            <div className="w-full max-w-[340px] md:max-w-[360px] relative perspective-1000">
              <motion.div 
                initial={{ rotateY: 15, rotateX: 5, y: 50, opacity: 0 }} whileInView={{ rotateY: -5, rotateX: 2, y: 0, opacity: 1 }} transition={{ duration: 1.2, type: "spring" }} viewport={{ once: true }}
                className="w-full h-[650px] md:h-[700px] bg-slate-800 rounded-[3.5rem] p-3 shadow-[20px_20px_60px_rgba(0,0,0,0.8)] border-[8px] border-slate-700 mx-auto relative transform-gpu flex flex-col"
              >
                {/* Dynamic Island */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-30 flex items-center justify-between px-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full opacity-50"></div>
                </div>

                <div className="bg-[#efeae2] w-full h-full rounded-[2.5rem] flex flex-col overflow-hidden relative">
                  
                  {/* StatusBar */}
                  <div className="bg-[#075e54] h-12 w-full pt-4 px-6 flex justify-between items-center text-white/90 text-[10px] font-bold z-20">
                    <span>10:41</span>
                    <div className="flex gap-1.5"><Signal size={12}/><Wifi size={12}/><Battery size={14}/></div>
                  </div>

                  {/* WA Header */}
                  <div className="bg-[#075e54] pb-3 px-4 text-white flex justify-between items-center shadow-md z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden p-1"><Image src="/main.png" width={28} height={28} alt="bot"/></div>
                      <div>
                        <h3 className="font-black text-base md:text-lg leading-tight tracking-tight">TRIPneO AI</h3>
                        <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest">{isBotTyping ? 'typing...' : 'online'}</p>
                      </div>
                    </div>
                    <MoreVertical size={20} className="text-white/80" />
                  </div>
                  
                  {/* Chat Area (Scrollable) - FIX: Attached container ref */}
                  <div ref={chatContainerRef} className="flex-1 p-3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] overflow-y-auto flex flex-col gap-3 pb-6 hide-scrollbar relative">
                    <AnimatePresence>
                      {chatMessages.map((msg) => (
                        <motion.div 
                          key={msg.id} initial={{ opacity: 0, scale: 0.9, y: 10, originX: msg.sender === 'right' ? 1 : 0 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                          className={`flex flex-col w-full ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          {msg.type === 'text' ? (
                            <div className={`${msg.sender === 'user' ? 'bg-[#dcf8c6] text-slate-800' : 'bg-white text-slate-800 border border-slate-100'} px-3 py-2 rounded-2xl ${msg.sender === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'} shadow-sm text-sm font-medium max-w-[85%]`}>
                              {msg.text}
                              <span className="block text-[9px] text-right text-slate-400 mt-1 font-bold">
                                {msg.time} {msg.sender === 'user' && <CheckCheck size={12} className="inline text-blue-500 ml-1"/>}
                              </span>
                            </div>
                          ) : (
                            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-md max-w-[85%] w-full border border-slate-200">
                              <div className="bg-emerald-50 rounded-xl p-4 flex flex-col items-center justify-center border border-emerald-100 mb-2">
                                <QrCode size={80} className="text-emerald-700 mb-2" />
                                <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">Valid</span>
                              </div>
                              <p className="text-sm font-bold text-slate-800 leading-tight">Confirmed! 🎉<br/><span className="text-emerald-600">Booking ID: BK1023</span></p>
                              <span className="block text-[9px] text-right text-slate-400 mt-1 font-bold">{msg.time}</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      {/* Typing Indicator */}
                      {isBotTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="self-start bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1 w-max">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Interactive Action Buttons (Bot Options) */}
                    <AnimatePresence>
                      {showActionButtons && !isBotTyping && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-2 w-[85%]">
                          <button onClick={() => handleSendMessage('KSRTC Sleeper – ₹850')} className="bg-white text-emerald-600 hover:bg-emerald-50 font-black text-center py-2.5 rounded-xl shadow-sm border border-emerald-100 text-sm transition-colors active:scale-95">KSRTC Sleeper – ₹850</button>
                          <button onClick={() => handleSendMessage('GreenLine A/C – ₹950')} className="bg-white text-emerald-600 hover:bg-emerald-50 font-black text-center py-2.5 rounded-xl shadow-sm border border-emerald-100 text-sm transition-colors active:scale-95">GreenLine A/C – ₹950</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quick Prompts */}
                  <AnimatePresence>
                    {showQuickReplies && !isBotTyping && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-16 w-full flex overflow-x-auto gap-2 px-2 pb-2 hide-scrollbar z-20">
                        <button onClick={() => handleSendMessage('Bus from Kochi to Bangalore')} className="bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 shadow-lg border border-slate-700 hover:bg-slate-700 transition-colors">🚌 Bus Kochi to BLR</button>
                        <button onClick={() => handleSendMessage('Flight to Mumbai')} className="bg-slate-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 shadow-lg border border-slate-700 hover:bg-slate-700 transition-colors">✈️ Flight to Mumbai</button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Interactive Input Area */}
                  <div className="bg-[#f0f0f0] p-2 flex items-center gap-2 z-30 border-t border-slate-200">
                    <input 
                      type="text" 
                      value={chatInput} 
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                      placeholder="Type a message..." 
                      className="flex-1 bg-white rounded-full px-4 py-2.5 text-slate-800 text-sm font-medium shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button 
                      onClick={() => handleSendMessage(chatInput)}
                      disabled={!chatInput.trim()}
                      className="w-10 h-10 bg-[#00a884] disabled:bg-slate-400 rounded-full flex items-center justify-center text-white shadow-md transition-colors active:scale-90"
                    >
                      <Send size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* --- DESTINATIONS PACKAGES --- */}
      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Curated Packages</h2>
            <p className="text-lg text-slate-500 mt-4 font-medium">Handpicked experiences across India's finest destinations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {destinations.map((dest, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} whileHover={{ y: -10 }} className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-slate-100 group cursor-pointer">
                <div className="h-72 overflow-hidden relative">
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-white">
                    <div>
                      <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">{dest.name}</h3>
                      <p className="text-emerald-300 font-bold mt-1 tracking-wide">{dest.tours}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-colors"><ArrowRightLeft size={20} /></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER SECTION --- */}
      <footer className="bg-slate-950 pt-24 pb-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
            
            <div className="space-y-6">
              <span translate="no" className="text-3xl font-black text-white tracking-tight">TRIP<span className="text-emerald-500">neO</span></span>
              <p className="text-slate-400 text-sm leading-relaxed font-medium pr-4">
                The scalable microservices-based transport booking platform powered by state-of-the-art Go architecture and Agentic AI.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all shadow-sm"><Icon size={20} /></a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-black text-xl mb-6">Book Tickets</h4>
              <ul className="space-y-4">
                {['Search Flights', 'Book Bus Tickets', 'IRCTC Train Booking', 'Airport Taxi Rentals', 'Check PNR Status'].map(item => (
                  <li key={item}><a href="#" className="text-slate-400 hover:text-emerald-400 text-sm font-bold transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xl mb-6">Support</h4>
              <ul className="space-y-4">
                {['24/7 AI Chatbot', 'Cancellation & Refunds', 'Report Fraud', 'Contact Us', 'Privacy Policy'].map(item => (
                  <li key={item}><a href="#" className="text-slate-400 hover:text-emerald-400 text-sm font-bold transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-black text-xl mb-6">Contact Us</h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-4"><div className="w-10 h-10 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center"><MapPinIcon size={18} className="text-emerald-500" /></div><span className="text-slate-400 text-sm font-bold leading-relaxed">Thurakkal, Manjeri<br/>Kerala, India 673016</span></li>
                <li className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center"><PhoneCall size={18} className="text-emerald-500" /></div><span className="text-slate-400 text-sm font-bold">+91 99999 99999</span></li>
                <li className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-slate-900 flex-shrink-0 flex items-center justify-center"><Mail size={18} className="text-emerald-500" /></div><span className="text-slate-400 text-sm font-bold">support@tripneo.com</span></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm font-bold">&copy; {new Date().getFullYear()} TRIPneO. All rights reserved.</p>
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Secured by</span>
              <ShieldCheck size={18} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}