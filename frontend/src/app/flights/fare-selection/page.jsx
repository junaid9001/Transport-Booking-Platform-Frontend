'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { flightApi } from '@/lib/flightApi';

export default function FareSelectionPage() {
  const router = useRouter();
  const selectedFlight = useBookingStore((state) => state.selectedFlight);
  const setSelectedFare = useBookingStore((state) => state.setSelectedFare);
  const searchQuery = useBookingStore((state) => state.searchQuery);
  
  const [fares, setFares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState(null);

  const totalPassengers = (searchQuery?.adults || 1) + (searchQuery?.children || 0) + (searchQuery?.infants || 0);

  useEffect(() => {
    if (!selectedFlight?.instance_id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [fareData, predictionData] = await Promise.allSettled([
          flightApi.getFares(selectedFlight.instance_id),
          flightApi.getFarePrediction(selectedFlight.instance_id),
        ]);
        
        if (fareData.status === 'fulfilled') {
          const raw = Array.isArray(fareData.value) ? fareData.value : [];
          const normalized = raw.map(f => ({
            ...f,
            seat_class: f.class || f.seat_class || 'ECONOMY',
          }));
          
          // Filter to only the user's selected cabin class
          const userClass = (searchQuery?.cabinClass || 'ECONOMY').toUpperCase();
          const classFiltered = normalized.filter(f => f.seat_class.toUpperCase() === userClass);
          
          // Use class-filtered fares if any exist, otherwise show all (max 3)
          setFares((classFiltered.length > 0 ? classFiltered : normalized).slice(0, 3));
        } else {
          const fallback = (selectedFlight.fares || []).map(f => ({
            ...f,
            seat_class: f.class || f.seat_class || 'ECONOMY',
          }));
          setFares(fallback.slice(0, 3));
        }

        if (predictionData.status === 'fulfilled') {
          setPrediction(predictionData.value?.data || predictionData.value);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFlight]);

  if (!selectedFlight) {
    return (
      <main className="pt-32 px-6 md:px-12 max-w-[900px] mx-auto text-center">
        <h1 className="text-4xl font-headline text-primary mb-6">No Flight Selected</h1>
        <p className="text-on-surface-variant mb-12 font-light">Your orchestration session has expired or no itinerary was chosen.</p>
        <button 
          onClick={() => router.push('/flights')} 
          className="border border-primary text-primary px-10 py-4 font-label text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all"
        >
          Return to Search
        </button>
      </main>
    );
  }

  const handleSelectFare = (fare) => {
    setSelectedFare(fare);
    router.push('/flights/seat-selection');
  };

  const departureTime = selectedFlight.departure_time
    ? new Date(selectedFlight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const arrivalTime = selectedFlight.arrival_time
    ? new Date(selectedFlight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const durationHours = Math.floor((selectedFlight.duration_minutes || 0) / 60);
  const durationMins = (selectedFlight.duration_minutes || 0) % 60;

  const signalConfig = {
    book_now: { label: 'Book Now', color: 'text-secondary', bg: 'bg-secondary/10', icon: 'trending_up' },
    wait: { label: 'Wait', color: 'text-amber-600', bg: 'bg-amber-50', icon: 'trending_down' },
    neutral: { label: 'Neutral', color: 'text-outline', bg: 'bg-surface-container-low', icon: 'trending_flat' },
  };
  const signal = signalConfig[prediction?.signal] || signalConfig.neutral;

  return (
    <main className="pt-24 md:pt-40 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto">
      
      <header className="mb-16 max-w-4xl">
        <span className="text-secondary font-label text-[10px] font-black uppercase tracking-[0.4em] block mb-6">Step 02 — Select Fare</span>
        <h1 className="font-headline text-5xl md:text-7xl tracking-tight text-primary leading-tight">
          Choose Your <span className="italic font-light">Experience.</span>
        </h1>
      </header>

      <div className="bg-surface-container-lowest border border-outline-variant/10 editorial-shadow p-8 mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-8 md:gap-16">
          <div className="text-center">
            <p className="font-headline text-3xl text-primary tracking-tighter">{departureTime}</p>
            <p className="font-label text-[9px] uppercase tracking-[0.3em] text-outline font-black mt-1">{selectedFlight.origin}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-label uppercase tracking-widest text-outline mb-2">
              {durationHours > 0 ? `${durationHours}h ${durationMins}m` : `${durationMins}m`}
            </span>
            <div className="flex items-center gap-2 opacity-30">
              <div className="w-12 h-px bg-primary"></div>
              <span className="material-symbols-outlined text-primary text-base">flight</span>
              <div className="w-12 h-px bg-primary"></div>
            </div>
            <span className="text-[9px] font-label uppercase tracking-widest text-outline mt-2">Non-stop</span>
          </div>
          <div className="text-center">
            <p className="font-headline text-3xl text-primary tracking-tighter">{arrivalTime}</p>
            <p className="font-label text-[9px] uppercase tracking-[0.3em] text-outline font-black mt-1">{selectedFlight.destination}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <p className="font-label text-[9px] uppercase tracking-widest text-outline font-black">{selectedFlight.airline_name}</p>
          <p className="font-headline text-xl text-primary">{selectedFlight.flight_number}</p>
          <p className="font-label text-[9px] uppercase tracking-widest text-outline">{totalPassengers} Traveler{totalPassengers > 1 ? 's' : ''}</p>
        </div>
      </div>

      {prediction && (
        <div className={`${signal.bg} border border-outline-variant/10 p-6 mb-12 flex items-center gap-6`}>
          <span className={`material-symbols-outlined text-2xl ${signal.color}`}>{signal.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <p className={`font-label text-[9px] uppercase tracking-widest font-black ${signal.color}`}>{signal.label}</p>
              <span className="font-label text-[9px] text-outline uppercase tracking-widest">· AI Confidence: {prediction.confidence}%</span>
            </div>
            <p className="text-xs text-on-surface-variant font-light">{prediction.reason}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-[11px] font-label text-outline uppercase tracking-[0.3em]">Fetching latest fares...</p>
        </div>
      ) : fares.length === 0 ? (
        <div className="bg-surface-container-low p-12 text-center border border-outline-variant/10">
          <p className="text-on-surface-variant font-light">No available fare types were returned for this flight.</p>
          <button onClick={() => router.push('/flights')} className="mt-8 text-primary font-label text-xs font-bold border-b border-primary/30 pb-0.5 uppercase tracking-widest">Browse Alternative Flights</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fares.map((fare, index) => {
            const isRecommended = fare.name?.toLowerCase().includes('flexi') || index === Math.floor(fares.length / 2);
            return (
              <div 
                key={fare.id || index} 
                className={`flex flex-col h-full bg-surface-container-lowest editorial-shadow transition-all duration-300 group border hover:border-secondary/30 relative ${isRecommended ? 'border-secondary/20 ring-1 ring-secondary/10' : 'border-outline-variant/5'}`}
              >
                {isRecommended && (
                  <div className="bg-secondary text-primary px-6 py-2 font-label text-[9px] font-black uppercase tracking-[0.3em] text-center">
                    Best Value
                  </div>
                )}
                
                <div className="p-10 flex flex-col h-full">
                  <div className="mb-8">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-black text-outline mb-3">{fare.seat_class}</p>
                    <h2 className="text-3xl font-headline text-primary group-hover:text-secondary transition-colors duration-300">{fare.name}</h2>
                  </div>

                  <div className="flex-grow space-y-5 mb-10">
                    <div className="flex items-center gap-3">
                      <span className="w-1 h-1 bg-secondary"></span>
                      <span className="text-xs text-on-surface-variant">7kg cabin baggage included</span>
                    </div>
                    {fare.name?.toLowerCase().includes('flexi') || fare.name?.toLowerCase().includes('super') ? (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="w-1 h-1 bg-secondary"></span>
                          <span className="text-xs text-on-surface-variant">Free date change</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-1 h-1 bg-secondary"></span>
                          <span className="text-xs text-on-surface-variant">Meal selection included</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-1 h-1 bg-secondary"></span>
                          <span className="text-xs text-on-surface-variant">Priority boarding</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="w-1 h-1 bg-outline-variant/30"></span>
                          <span className="text-xs text-on-surface-variant/60">Date change fee applies</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-1 h-1 bg-outline-variant/30"></span>
                          <span className="text-xs text-on-surface-variant/60">Standard boarding</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-auto border-t border-outline-variant/10 pt-8">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-headline text-primary tracking-tight">₹{fare.price?.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] font-label text-outline uppercase tracking-widest mb-6">per person · {totalPassengers} × = ₹{(fare.price * totalPassengers)?.toLocaleString()}</p>
                    
                    <button
                      onClick={() => handleSelectFare(fare)}
                      className={`w-full py-5 font-label text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-300 ${
                        isRecommended 
                          ? 'bg-primary text-secondary hover:bg-secondary hover:text-primary' 
                          : 'bg-transparent border border-primary/20 text-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      Select {fare.name}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
