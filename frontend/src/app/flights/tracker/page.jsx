'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useBookingStore } from '@/lib/store';
import { flightApi } from '@/lib/flightApi';

export default function FlightTrackerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeBooking = useBookingStore(state => state.activeBooking);
  const selectedFlight = useBookingStore(state => state.selectedFlight);
  
  const [telemetry, setTelemetry] = useState({
    lat: 51.4700,
    lng: -0.4543,
    alt: 10668,
    vel: 850,
    heading: 95,
    status: 'EN_ROUTE',
    lastUpdated: new Date().toISOString()
  });

  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  const pnr = searchParams.get('pnr') || activeBooking?.pnr || 'TNEO2X';

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await flightApi.getFlightStatus(pnr);
        if (status) setTelemetry(prev => ({ ...prev, ...status }));
      } catch (err) {
        console.error("Status fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    const wsUrl = `ws://localhost:8080/api/flights/ws?pnr=${pnr}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'TELEMETRY_UPDATE') {
          setTelemetry(prev => ({ ...prev, ...msg.payload }));
        }
      } catch (err) {
        console.error("WS Telemetry Error:", err);
      }
    };

    // Simulated Drift for cinematic effect if no real data
    const interval = setInterval(() => {
        setTelemetry(prev => ({
            ...prev,
            lat: prev.lat + (Math.random() - 0.5) * 0.001,
            lng: prev.lng + (Math.random() - 0.5) * 0.001,
            alt: prev.alt + (Math.random() - 0.5) * 10,
            vel: prev.vel + (Math.random() - 0.5) * 5,
        }));
    }, 2000);

    return () => {
        ws.close();
        clearInterval(interval);
    };
  }, [pnr]);

  return (
    <main className="relative w-full h-screen overflow-hidden pt-24 bg-[#0a0a0b]">
      
      <div 
        className="absolute inset-0 z-0 scale-105"
        style={{
          backgroundImage: "url('/images/dark_map.png')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 0.6
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-transparent to-[#0a0a0b]"></div>
        
        <div 
            className="absolute transition-all duration-1000 ease-in-out"
            style={{ 
                top: `${40 + (telemetry.lat - 51.47) * 100}%`, 
                left: `${50 + (telemetry.lng + 0.45) * 100}%` 
            }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-secondary/20 animate-ping"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-secondary/40 animate-pulse"></div>
          
          <div 
            className="bg-surface-container-lowest p-4 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.1)] relative z-10 border border-white/10"
            style={{ transform: `rotate(${telemetry.heading}deg)` }}
          >
            <span className="material-symbols-outlined text-secondary text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>flight</span>
          </div>
        </div>

        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M 20 80 Q 50 40 80 20" fill="none" stroke="white" strokeWidth="0.05" strokeDasharray="1 1" opacity="0.1" />
        </svg>
      </div>

      <aside className="absolute left-10 top-32 w-96 z-40 bg-black/40 backdrop-blur-3xl border border-white/5 p-12 space-y-12 editorial-shadow">
        <header className="space-y-4">
           <div className="flex items-center gap-4 text-secondary">
               <span className="material-symbols-outlined text-sm animate-pulse">radar</span>
               <span className="font-label text-[10px] uppercase tracking-[0.4em] font-black">Live Orchestration</span>
           </div>
           <div>
              <h2 className="text-4xl font-headline text-white tracking-tighter uppercase">{selectedFlight?.flight_number || 'TN-402'}</h2>
              <p className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em] mt-2">
                {selectedFlight?.origin || 'LHR'} — {selectedFlight?.destination || 'HND'}
              </p>
           </div>
        </header>

        <nav className="space-y-8">
               <div className="grid grid-cols-2 gap-8 tabular-nums">
                  <div className="space-y-2">
                     <p className="text-outline font-label text-[9px] uppercase tracking-[0.3em] font-black">Latitude</p>
                     <div className="h-8">
                        <p className="text-2xl font-headline text-white">{telemetry.lat.toFixed(4)}°</p>
                     </div>
                  </div>
                  <div className="space-y-2 text-right">
                     <p className="text-outline font-label text-[9px] uppercase tracking-[0.3em] font-black">Longitude</p>
                     <div className="h-8">
                        <p className="text-2xl font-headline text-white">{telemetry.lng.toFixed(4)}°</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-6 pt-8 border-t border-white/5 tabular-nums">
                  <div className="flex justify-between items-end">
                      <p className="text-outline font-label text-[9px] uppercase tracking-[0.3em] font-black">Vertical Velocity</p>
                      <div className="h-10 flex items-end">
                        <p className="text-4xl font-headline text-white tracking-tighter">{Math.round(telemetry.vel)} <span className="text-xs font-light text-outline">KM/H</span></p>
                      </div>
                  </div>
                  <div className="h-1 w-full bg-white/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-secondary transition-all duration-1000" style={{ width: `${Math.min(100, (telemetry.vel / 1000) * 100)}%` }}></div>
                  </div>
               </div>

               <div className="space-y-6 tabular-nums">
                  <div className="flex justify-between items-end">
                      <p className="text-outline font-label text-[9px] uppercase tracking-[0.3em] font-black">Geometric Altitude</p>
                      <div className="h-10 flex items-end">
                        <p className="text-4xl font-headline text-white tracking-tighter">{Math.round(telemetry.alt).toLocaleString()} <span className="text-xs font-light text-outline">M</span></p>
                      </div>
                  </div>
                  <div className="h-1 w-full bg-white/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-white/40 transition-all duration-1000" style={{ width: `${Math.min(100, (telemetry.alt / 12000) * 100)}%` }}></div>
                  </div>
               </div>
        </nav>

        <footer className="pt-12 border-t border-white/5">
           <div className="flex justify-between items-center mb-10">
              <span className="text-[10px] font-label uppercase tracking-[0.3em] text-outline font-black">Current Sector</span>
              <span className="text-[10px] font-label uppercase tracking-[0.3em] text-secondary font-black bg-secondary/5 px-3 py-1 border border-secondary/10">In-Transit</span>
           </div>
           <button 
             onClick={() => router.push('/dashboard')}
             className="w-full bg-white text-black py-5 font-label text-[10px] font-black uppercase tracking-[0.4em] hover:bg-secondary hover:text-white transition-all shadow-2xl"
           >
              Exit Manifest
           </button>
        </footer>
      </aside>

      <div className="absolute top-32 right-10 z-40 text-right space-y-2 pointer-events-none">
         <p className="text-outline font-label text-[9px] uppercase tracking-[0.3em] font-black">Synchronized Local Time</p>
         <p className="text-4xl font-headline text-white tabular-nums">{new Date().toLocaleTimeString([], { hour12: false })}</p>
      </div>

    </main>
  );
}
