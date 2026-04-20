'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useBookingStore, useAuthStore } from '@/lib/store';
import { flightApi } from '@/lib/flightApi';
import { useFlightSocket } from '@/hooks/useFlightSocket';
import SessionExpiryModal from '@/components/flights/SessionExpiryModal';

export default function PassengerDetailsPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const selectedFlight = useBookingStore(state => state.selectedFlight);
  const selectedFare = useBookingStore(state => state.selectedFare);
  const selectedSeats = useBookingStore(state => state.selectedSeats);
  const searchQuery = useBookingStore(state => state.searchQuery);
  const activeBooking = useBookingStore(state => state.activeBooking);
  const setActiveBooking = useBookingStore(state => state.setActiveBooking);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showExpiryModal, setShowExpiryModal] = useState(false);

  useFlightSocket(user?.id, (msg) => {
    if (msg.type === 'SESSION_EXPIRED' || msg.event === 'SESSION_EXPIRED') {
       setShowExpiryModal(true);
    }
  });

  // Wait for Zustand store hydration before checking guards
  useEffect(() => { setMounted(true); }, []);

  const adults = searchQuery?.adults || 1;
  const children = searchQuery?.children || 0;
  const infants = searchQuery?.infants || 0;

  const initialTravelers = useMemo(() => {
    const arr = [];
    for (let i = 0; i < adults; i++) arr.push({ type: 'adult', first_name: '', last_name: '', dob: '', gender: 'MALE', id_type: 'PASSPORT', id_number: '' });
    for (let i = 0; i < children; i++) arr.push({ type: 'child', first_name: '', last_name: '', dob: '', gender: 'MALE', id_type: 'PASSPORT', id_number: '' });
    for (let i = 0; i < infants; i++) arr.push({ type: 'infant', first_name: '', last_name: '', dob: '', gender: 'MALE', id_type: 'PASSPORT', id_number: '' });
    return arr;
  }, [adults, children, infants]);

  const [travelers, setTravelers] = useState(initialTravelers);

  const updateTraveler = (index, field, value) => {
    const updated = [...travelers];
    updated[index] = { ...updated[index], [field]: value };
    setTravelers(updated);
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!selectedFlight?.instance_id) {
      setError("No flight selected. Please restart your search.");
      return;
    }

    if (!selectedFare) {
      setError("No fare selected. Please choose a fare first.");
      return;
    }

    const { isAuthenticated, setAuthModalOpen } = useAuthStore.getState();
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let seatIdx = 0;
      const passengersPayload = travelers.map((t) => {
        const p = {
          first_name: t.first_name,
          last_name: t.last_name,
          date_of_birth: t.dob,
          // API spec requires lowercase: 'male', 'female'
          gender: t.gender?.toLowerCase(),
          // API spec requires: 'adult', 'child', 'infant'
          passenger_type: t.type,
          id_type: t.id_type,
          id_number: t.id_number,
        };
        
        // For non-infants: send seat_id using the seat's UUID (required by backend)
        if (t.type !== 'infant' && selectedSeats[seatIdx]) {
          const seatId = selectedSeats[seatIdx].id || selectedSeats[seatIdx].seat_id;
          if (!seatId) {
            console.error("Critical: Seat UUID missing for seat", selectedSeats[seatIdx].seat_number);
          }
          p.seat_id = seatId;
          seatIdx++;
        }
        
        return p;
      });

      const payload = {
        flight_instance_id: selectedFlight.instance_id,
        fare_type_id: selectedFare.id || selectedFare.fare_type_id,
        trip_type: searchQuery?.tripType || "one_way",
        seat_class: selectedFare.seat_class || selectedFare.class || "ECONOMY",
        passengers: passengersPayload,
      };

      console.log('📤 Booking Payload:', JSON.stringify(payload, null, 2));

      const bookingResponse = await flightApi.createBooking(payload);
      setActiveBooking(bookingResponse?.data || bookingResponse);
      router.push('/flights/review');
    } catch (err) {
      console.error("Booking Creation Error:", err);
      console.error("📥 Error Response Body:", JSON.stringify(err.response?.data, null, 2));
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data?.detail || "Booking failed. Please check all fields and try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedFlight || !selectedFare) {
    return (
      <main className="pt-32 px-6 md:px-12 max-w-[900px] mx-auto text-center">
        <h1 className="text-3xl font-headline text-primary mb-4">Session Expired</h1>
        <p className="text-on-surface-variant mb-8">Your flight or fare selection is missing. Please start a new search.</p>
        <button 
          onClick={() => router.push('/flights')} 
          className="bg-primary text-white px-8 py-3 rounded-lg font-label text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
        >
          Search Flights
        </button>
      </main>
    );
  }

  return (
    <main className="pt-24 md:pt-40 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-20">
      
      <div className="w-full lg:w-[60%] space-y-20">
        
        <section className="space-y-6">
          <span className="text-secondary font-label text-xs font-bold uppercase tracking-[0.4em] block">Step 04 — Traveler Information</span>
          <h1 className="text-5xl md:text-7xl font-headline font-normal tracking-tight text-primary leading-tight">
            Who is <span className="italic font-light">traveling?</span>
          </h1>
          <p className="text-on-surface-variant text-lg font-light max-w-xl">
            Please enter passenger names exactly as they appear on passports or official travel documents to ensure a smooth journey.
          </p>
        </section>

        <form onSubmit={handleContinue} className="space-y-16">
          {travelers.map((traveler, index) => {
            // Find assigned seat for non-infants
            let seatNumber = '--';
            if (traveler.type !== 'infant') {
              // Count how many non-infants came before this one
              const nonInfantIdx = travelers.slice(0, index).filter(t => t.type !== 'infant').length;
              seatNumber = selectedSeats[nonInfantIdx]?.seat_number || '--';
            }

            return (
              <section key={index} className="bg-surface-container-lowest p-10 editorial-shadow space-y-12 border border-outline-variant/10">
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-8">
                  <h2 className="text-2xl font-headline text-primary">
                    Traveler {index + 1} ({traveler.type.charAt(0).toUpperCase() + traveler.type.slice(1)})
                  </h2>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-label font-bold text-secondary uppercase tracking-widest">
                      {traveler.type === 'infant' ? 'In-Lap' : `Seat ${seatNumber}`}
                    </p>
                    <span className="material-symbols-outlined text-secondary text-3xl">
                      {traveler.type === 'infant' ? 'child_care' : 'person'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-2 group">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-outline group-focus-within:text-secondary transition-colors">Given Name</label>
                    <input 
                      required 
                      className="w-full bg-transparent border-none border-b border-outline-variant/30 focus:ring-0 focus:border-secondary transition-all px-0 py-3 font-headline text-xl text-primary placeholder:text-outline-variant/50" 
                      placeholder="John" 
                      type="text" 
                      value={traveler.first_name}
                      onChange={(e) => updateTraveler(index, 'first_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-outline group-focus-within:text-secondary transition-colors">Surname</label>
                    <input 
                      required 
                      className="w-full bg-transparent border-none border-b border-outline-variant/30 focus:ring-0 focus:border-secondary transition-all px-0 py-3 font-headline text-xl text-primary placeholder:text-outline-variant/50" 
                      placeholder="Doe" 
                      type="text" 
                      value={traveler.last_name}
                      onChange={(e) => updateTraveler(index, 'last_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-outline group-focus-within:text-secondary transition-colors">Date of Birth</label>
                    <input 
                      required 
                      className="w-full bg-transparent border-none border-b border-outline-variant/30 focus:ring-0 focus:border-secondary transition-all px-0 py-3 font-headline text-xl text-primary" 
                      type="date" 
                      value={traveler.dob}
                      onChange={(e) => updateTraveler(index, 'dob', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-outline group-focus-within:text-secondary transition-colors">Gender</label>
                    <select 
                      className="w-full bg-transparent border-none border-b border-outline-variant/30 focus:ring-0 focus:border-secondary transition-all px-0 py-3 font-headline text-xl text-primary appearance-none cursor-pointer"
                      value={traveler.gender}
                      onChange={(e) => updateTraveler(index, 'gender', e.target.value)}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-outline group-focus-within:text-secondary transition-colors">ID Type</label>
                    <select 
                      className="w-full bg-transparent border-none border-b border-outline-variant/30 focus:ring-0 focus:border-secondary transition-all px-0 py-3 font-headline text-xl text-primary appearance-none cursor-pointer"
                      value={traveler.id_type}
                      onChange={(e) => updateTraveler(index, 'id_type', e.target.value)}
                    >
                      <option value="PASSPORT">Passport</option>
                      <option value="AADHAAR">Aadhaar Card</option>
                      <option value="PAN">PAN Card</option>
                    </select>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-outline group-focus-within:text-secondary transition-colors">Identification Number</label>
                    <input 
                      required 
                      className="w-full bg-transparent border-none border-b border-outline-variant/30 focus:ring-0 focus:border-secondary transition-all px-0 py-3 font-headline text-xl text-primary placeholder:text-outline-variant/50" 
                      placeholder="Enter Document ID" 
                      type="text" 
                      value={traveler.id_number}
                      onChange={(e) => updateTraveler(index, 'id_number', e.target.value)}
                    />
                  </div>
                </div>
              </section>
            );
          })}

          <button 
            type="submit" 
            disabled={loading}
            className={`group w-full md:w-auto bg-primary text-white px-20 py-6 font-label text-xs font-black uppercase tracking-[0.4em] hover:bg-secondary hover:text-on-secondary-fixed-variant transition-all duration-500 flex items-center justify-center gap-4 ${loading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {loading ? "Preparing your booking..." : "Confirm All Details"}
            {!loading && <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">east</span>}
          </button>
        </form>
      </div>

      <aside className="w-full lg:w-[40%]">
        <div className="sticky top-32 space-y-10">
          <div className="bg-surface-container-low p-10 editorial-shadow space-y-10">
            <h3 className="font-headline text-3xl">Booking Summary</h3>
            
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] uppercase tracking-widest text-outline mb-2">Itinerary</p>
                   <p className="font-headline text-2xl text-primary">{selectedFlight.origin} to {selectedFlight.destination}</p>
                   <p className="text-sm font-light text-on-surface-variant mt-1">{selectedFlight.airline_name} • {selectedFlight.flight_number}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] uppercase tracking-widest text-secondary font-bold mb-2">Selected Fare</p>
                   <p className="font-headline text-xl text-primary">{selectedFare.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-8 border-y border-outline-variant/10">
                <div>
                   <p className="text-[10px] uppercase tracking-widest text-outline mb-2">Class</p>
                   <p className="font-headline text-xl text-primary">{selectedFare.seat_class || 'Economy'}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] uppercase tracking-widest text-outline mb-2">Seats Assigned</p>
                   <p className="font-headline text-xl text-secondary">
                    {selectedSeats.length > 0 ? selectedSeats.map(s => s.seat_number).join(', ') : '--'}
                   </p>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between text-sm">
                   <span className="text-on-surface-variant font-light">Base Fares ({travelers.length} Travelers)</span>
                   <span className="text-primary font-medium">₹{(selectedFare.price * travelers.length).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-on-surface-variant font-light">Ancillaries & Fees</span>
                   <span className="text-primary font-medium">₹{(selectedSeats.reduce((acc, s) => acc + (s.extra_charge || 0), 0)).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-end pt-6 border-t border-outline-variant/20">
                   <span className="text-[10px] uppercase tracking-widest font-black text-primary">Total Amount</span>
                   <span className="text-5xl font-headline text-primary tracking-tighter">
                    ₹{(selectedFare.price * travelers.length + selectedSeats.reduce((acc, s) => acc + (s.extra_charge || 0), 0)).toLocaleString()}
                   </span>
                 </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-error/5 border border-error/10 text-error text-xs font-bold text-center">
                {error}
              </div>
            )}
          </div>

          <div className="p-10 border border-outline-variant/10 space-y-6">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-secondary">verified_user</span>
              <p className="text-[11px] uppercase tracking-widest font-bold text-primary">Travel Assurance</p>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed font-light">
              Your booking is protected by our global fulfillment engine. Seats are held for a limited duration during this booking phase.
            </p>
          </div>
        </div>
      </aside>

      <SessionExpiryModal 
        isOpen={showExpiryModal} 
        onClose={() => setShowExpiryModal(false)} 
      />
    </main>
  );
}
