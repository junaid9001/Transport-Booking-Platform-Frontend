"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, Train, Plane, Car, Sparkles, ShieldCheck, Zap, Headset, 
  MapPin, Calendar, ArrowRightLeft, Search, Facebook, Twitter, 
  Instagram, Linkedin, Mail, PhoneCall, MapPin as MapPinIcon,
  CarTaxiFrontIcon, MessageCircle, Send, CheckCheck, Bot, QrCode
} from 'lucide-react';

const services = [
  { name: 'Bus Tickets', icon: Bus, id: 'bus' },
  { name: 'Train Tickets', icon: Train, id: 'train' },
  { name: 'Flight Tickets', icon: Plane, id: 'flight' },
  { name: 'Taxi', icon: CarTaxiFrontIcon, id: 'taxi' },
];

const backgroundImages = [ 
  "/images/Flight.png",
  "/images/Taxi.avif",
  "/images/train.avif",
  "/images/Bus.avif"
];

const offers = [
  { title: 'Flat 15% Off on Flights', code: 'TRIPFLY15', img: "/images/offers/flightoffer.png" },
  { title: 'Save ₹500 on First Bus', code: 'NEWBUS500', img: "/images/offers/Bus.avif" },
  { title: 'Free Taxi Upgrades', code: 'PREMIUMRIDE', img: "/images/offers/taxioffer.avif" },
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

  // Background Slider Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prevBg) => (prevBg + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSwap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  return (
    <div className="relative overflow-hidden bg-slate-50">
      
      {/* --- HERO SECTION --- */}
      <div className="relative pt-20 pb-32 lg:pt-28 lg:pb-40">
        
        {/* Animated Background Image Slider */}
        <div className="absolute inset-0 z-0 bg-slate-900 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.img 
              key={currentBg}
              src={backgroundImages[currentBg]}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              alt="Transport Background" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/90 via-emerald-900/70 to-slate-50"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4"
            >
              India's Smartest Travel Platform
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-emerald-50"
            >
              Instantly book buses, trains, flights, and taxis with AI-powered recommendations.
            </motion.p>
          </div>

          {/* THE SEARCH COMPONENT */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl shadow-emerald-900/20 overflow-hidden"
          >
            {/* Service Tabs */}
            <div className="flex overflow-x-auto bg-white border-b border-slate-200 hide-scrollbar px-2 pt-2">
              {services.map((service) => {
                const isActive = activeTab === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => setActiveTab(service.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold transition-all min-w-[160px] relative
                      ${isActive 
                        ? 'text-emerald-600' 
                        : 'text-slate-500 hover:text-emerald-500 hover:bg-slate-50 rounded-t-xl'
                      }`}
                  >
                    <service.icon size={20} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
                    {service.name}
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Form Inputs */}
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-stretch bg-white border border-slate-300 rounded-xl hover:border-emerald-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all shadow-sm">
                
                {/* FROM & TO WRAPPER */}
                <div className="flex flex-col md:flex-row flex-[2] relative">
                  <div className="flex-1 px-6 py-4 hover:bg-slate-50 transition cursor-text group md:border-r border-b md:border-b-0 border-slate-300 rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">From</label>
                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="text" 
                        value={fromLocation}
                        onChange={(e) => setFromLocation(e.target.value)}
                        className="w-full text-2xl font-bold text-slate-900 bg-transparent focus:outline-none truncate placeholder:font-normal placeholder:text-slate-300" 
                        placeholder="Leaving from..." 
                      />
                    </div>
                  </div>

                  {/* Swap Button */}
                  <button 
                    onClick={handleSwap}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-slate-200 rounded-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 shadow-md flex items-center justify-center hover:scale-105 transition-all"
                  >
                    <ArrowRightLeft size={18} className="rotate-90 md:rotate-0" />
                  </button>

                  <div className="flex-1 px-6 py-4 hover:bg-slate-50 transition cursor-text group md:border-r border-b md:border-b-0 border-slate-300">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">To</label>
                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        type="text" 
                        value={toLocation}
                        onChange={(e) => setToLocation(e.target.value)}
                        className="w-full text-2xl font-bold text-slate-900 bg-transparent focus:outline-none truncate placeholder:font-normal placeholder:text-slate-300" 
                        placeholder="Going to..." 
                      />
                    </div>
                  </div>
                </div>

                {/* Date Input */}
                <div className="flex-[1] px-6 py-4 hover:bg-slate-50 transition cursor-text group w-full">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Travel Date</label>
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="date" 
                      className="w-full text-xl font-bold text-slate-900 bg-transparent focus:outline-none [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100" 
                    />
                  </div>
                </div>

                {/* Search Button */}
                <div className="p-2 w-full md:w-auto flex-shrink-0 bg-slate-50 md:bg-transparent rounded-b-xl md:rounded-b-none border-t md:border-t-0 border-slate-300 flex items-center justify-center">
                  <button className="w-full md:w-auto h-full px-10 py-4 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95">
                    <Search size={22} />
                    <span>Search</span>
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- WHATSAPP AI CHATBOT PREVIEW SECTION --- */}
      <div className="bg-white py-24 relative overflow-hidden border-b border-slate-200">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-50 rounded-full blur-[120px] opacity-60 pointer-events-none -mr-40 -mt-40" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm mb-6">
                <Bot size={18} />
                <span>Meet your AI Travel Assistant</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
                Book tickets directly through <span className="text-[#25D366]">WhatsApp.</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Skip the app. Our intelligent NLP chatbot understands your natural language. Just text where you want to go, and the AI handles searching, seat selection, secure payment, and ticket delivery—all inside WhatsApp.
              </p>
              
              <ul className="space-y-4 mb-10">
                {['Instant AI route recommendations', 'Get QR Code tickets delivered to chat', 'Check live PNR & tracking status', 'Interactive button selection'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCheck size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <button className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-[#25D366]/30 transition-all hover:-translate-y-1">
                <MessageCircle size={22} />
                Try it on WhatsApp
              </button>
            </motion.div>

            {/* Animated Phone Mockup with Interactive WhatsApp Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="relative mx-auto w-full max-w-[340px] h-[680px] bg-slate-900 rounded-[3rem] p-3 shadow-[0_20px_50px_-12px_rgba(16,185,129,0.3)] border-[6px] border-slate-800"
            >
              <div className="bg-[#efeae2] w-full h-full rounded-[2.25rem] overflow-hidden flex flex-col relative">
                
                {/* WA Header */}
                <div className="bg-[#075e54] pt-12 pb-3 px-4 flex items-center gap-3 text-white shadow-md z-10">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <Image src="/main.png" width={28} height={28} alt="Bot Icon" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base leading-tight">TRIPneO Assistant</h3>
                    <p className="text-xs text-emerald-100 font-medium">online</p>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-4 space-y-4 overflow-y-hidden flex flex-col pt-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                  
                  {/* User Message 1 */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, x: 20 }} whileInView={{ opacity: 1, scale: 1, x: 0 }} 
                    transition={{ delay: 0.3 }} viewport={{ once: true }}
                    className="self-end bg-[#dcf8c6] text-slate-800 px-4 py-2 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] text-[15px]"
                  >
                    Bus from Kochi to Bangalore tomorrow
                    <span className="block text-[10px] text-right text-slate-500 mt-1">10:41 AM <CheckCheck size={12} className="inline text-blue-500 ml-1"/></span>
                  </motion.div>

                  {/* Bot Message 1 (With Buttons) */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, x: -20 }} whileInView={{ opacity: 1, scale: 1, x: 0 }} 
                    transition={{ delay: 1.2 }} viewport={{ once: true }}
                    className="self-start w-full max-w-[90%]"
                  >
                    <div className="bg-white text-slate-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm text-[15px]">
                      I found some great bus options for you! 🚌
                      <span className="block text-[10px] text-right text-slate-400 mt-1">10:41 AM</span>
                    </div>
                    {/* WhatsApp Interactive Buttons */}
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="bg-white text-[#00a884] font-bold text-center py-2.5 rounded-xl shadow-sm border border-slate-100 cursor-pointer">
                        KSRTC Sleeper – ₹850
                      </div>
                      <div className="bg-white text-[#00a884] font-bold text-center py-2.5 rounded-xl shadow-sm border border-slate-100 cursor-pointer">
                        GreenLine A/C – ₹950
                      </div>
                    </div>
                  </motion.div>

                  {/* User Message 2 (Simulating clicking the button) */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, x: 20 }} whileInView={{ opacity: 1, scale: 1, x: 0 }} 
                    transition={{ delay: 2.8 }} viewport={{ once: true }}
                    className="self-end bg-[#dcf8c6] text-slate-800 px-4 py-2 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] text-[15px]"
                  >
                    KSRTC Sleeper – ₹850
                    <span className="block text-[10px] text-right text-slate-500 mt-1">10:42 AM <CheckCheck size={12} className="inline text-blue-500 ml-1"/></span>
                  </motion.div>

                  {/* Bot Message 2 (Ticket) */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, x: -20 }} whileInView={{ opacity: 1, scale: 1, x: 0 }} 
                    transition={{ delay: 3.8 }} viewport={{ once: true }}
                    className="self-start bg-white text-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[90%] w-full"
                  >
                    <div className="bg-emerald-50 rounded-xl p-3 mb-2 flex items-center justify-center border border-emerald-100">
                      <QrCode size={60} className="text-emerald-700" />
                    </div>
                    <p className="text-[15px]">Ticket Confirmed! 🎉<br/>Booking ID: <span className="font-bold">BK1023</span></p>
                    <span className="block text-[10px] text-right text-slate-400 mt-1">10:42 AM</span>
                  </motion.div>

                </div>

                {/* Input Area */}
                <div className="bg-[#f0f0f0] p-2 flex items-center gap-2 z-10">
                  <div className="flex-1 bg-white rounded-full px-4 py-2.5 text-slate-400 text-sm">
                    Type a message
                  </div>
                  <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-md">
                    <Send size={18} className="ml-1" />
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* --- REDESIGNED ABOUT / WHY CHOOSE US SECTION --- */}
      <div className="relative py-32 bg-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <Image src="/images/destinations/munnar.jpg" alt="Background" fill className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/80"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Title Area */}
            <div className="lg:col-span-4 text-left">
              <span className="text-emerald-400 font-bold tracking-wider uppercase text-sm mb-2 block">Our Philosophy</span>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                Travel <br/>Reimagined.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                We believe booking a trip should be as relaxing as the vacation itself. By combining state-of-the-art Go microservices with Python Agentic AI, we deliver unparalleled speed, security, and smart recommendations.
              </p>
              <button className="text-white font-bold border-b-2 border-emerald-500 pb-1 hover:text-emerald-400 transition-colors">
                Learn more about our Tech →
              </button>
            </div>

            {/* Feature Cards Area */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all transform hover:-translate-y-2">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Agentic AI Workflows</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Our system uses RAG and Vector Databases to fetch real-time routes, compare pricing, and suggest the absolute best journey tailored just for you.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all transform hover:-translate-y-2 md:translate-y-8">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Microservice Security</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Built on a robust Go backend with isolated service architecture and Kafka event streaming, ensuring your payments and data are never compromised.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all transform hover:-translate-y-2">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Redis Seat Locking</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  No more "seat unavailable" errors at checkout. Our high-speed Redis caching locks your seat the moment you select it.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all transform hover:-translate-y-2 md:translate-y-8">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                  <QrCode size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Smart QR Ticketing</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Paperless and secure. Your verified ticket is delivered instantly via email or WhatsApp as an encrypted QR code.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- POPULAR DESTINATIONS SECTION --- */}
      <div className="bg-white py-24 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-slate-900 mb-2">Explore Destinations</h2>
          <p className="text-lg text-slate-500 mb-12">Discover India's most loved travel spots</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {destinations.map((dest, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-slate-100 group cursor-pointer"
              >
                <div className="h-64 overflow-hidden relative">
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6 transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex justify-between items-center text-white">
                    <span className="font-bold">View Packages</span>
                    <ArrowRightLeft size={18} />
                  </div>
                </div>
                <div className="p-6 bg-white relative z-10">
                  <h3 className="text-xl font-black text-slate-900">{dest.name}</h3>
                  <p className="text-emerald-600 font-bold mt-1">{dest.tours}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* --- OFFERS SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Exclusive Offers</h2>
            <p className="text-lg text-slate-500 mt-2">Best deals on your favorite transport</p>
          </div>
          <button className="text-emerald-600 font-bold hover:text-emerald-700 hidden sm:block">View All Deals →</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="relative rounded-3xl overflow-hidden shadow-xl h-52 cursor-pointer group"
            >
              <img src={offer.img} alt={offer.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 via-emerald-900/60 to-transparent p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-black text-white mb-3 max-w-[80%] leading-tight">{offer.title}</h3>
                <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-white border border-white/40 rounded-lg text-sm font-bold w-max shadow-sm">
                  Use Code: {offer.code}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- FOOTER SECTION --- */}
      <footer className="bg-slate-900 pt-20 pb-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            <div className="space-y-6">
              <span className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent tracking-tight">
                TRIPneO
              </span>
              <p className="text-slate-400 text-sm leading-relaxed">
                The scalable microservices-based transport booking platform. We use AI to help you find the best routes for Bus, Train, Flight, and Taxi rentals across India.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all"><Twitter size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all"><Linkedin size={18} /></a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">Book Tickets</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Search Flights</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Book Bus Tickets</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">IRCTC Train Booking</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Airport Taxi Rentals</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Check PNR Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">24/7 AI Chatbot Help</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Cancellation & Refunds</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Report Fraud</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Contact Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-lg mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPinIcon size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-sm leading-relaxed font-medium">Thurakkal, Manjeri<br/>Kerala, India 673016</span>
                </li>
                <li className="flex items-center gap-3">
                  <PhoneCall size={18} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-400 text-sm font-medium">+91 99999 99999</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-slate-400 text-sm font-medium">support@tripneo.com</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm text-center md:text-left font-medium">
              &copy; {new Date().getFullYear()} TRIPneO. All rights reserved. Built with Go & Next.js.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm font-medium">Secured by</span>
              <ShieldCheck size={20} className="text-emerald-500" />
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}