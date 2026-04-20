'use client';
import { useEffect, useMemo, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { flightApi } from '@/lib/flightApi';

export default function SeatSelectionPage() {
  const router = useRouter();
  const selectedFlight = useBookingStore((state) => state.selectedFlight);
  const selectedFare = useBookingStore((state) => state.selectedFare);
  const searchQuery = useBookingStore((state) => state.searchQuery);
  const setSelectedSeats = useBookingStore((state) => state.setSelectedSeats);

  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState([]);
  const [economySeats, setEconomySeats] = useState([]);
  const [businessSeats, setBusinessSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const adults = searchQuery?.adults || 1;
  const children = searchQuery?.children || 0;
  const infants = searchQuery?.infants || 0;
  const requiredSeats = adults + children;

  useEffect(() => {
    if (!selectedFlight?.instance_id) {
      setLoading(false);
      return;
    }

    const fetchSeats = async () => {
      try {
        setLoading(true);
        const data = await flightApi.getSeats(selectedFlight.instance_id);
        setEconomySeats(Array.isArray(data?.economy_seats) ? data.economy_seats : []);
        setBusinessSeats(Array.isArray(data?.business_seats) ? data.business_seats : []);
      } catch (err) {
        console.error("Failed to fetch seats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [selectedFlight]);

  const allSeats = useMemo(() => [...businessSeats, ...economySeats], [businessSeats, economySeats]);

  const handleSeatClick = (seat) => {
    if (!seat?.is_available) return;

    setSelectedSeatNumbers((prev) => {
      if (prev.includes(seat.seat_number)) {
        return prev.filter((num) => num !== seat.seat_number);
      }
      
      if (prev.length >= requiredSeats) {
        return [...prev.slice(1), seat.seat_number];
      }
      return [...prev, seat.seat_number];
    });
  };

  const handleContinue = () => {
    const selected = selectedSeatNumbers.map(num => allSeats.find(s => s.seat_number === num)).filter(Boolean);
    setSelectedSeats(selected);
    router.push('/flights/passenger-details');
  };

  if (!selectedFlight) {
    return (
      <main className="pt-32 px-6 md:px-12 max-w-[900px] mx-auto text-center">
        <h1 className="text-4xl font-headline text-primary mb-6">Orchestration Lost</h1>
        <p className="text-on-surface-variant mb-12 font-light">Please select your desired itinerary and fare before proceeding to seat selection.</p>
        <button 
          onClick={() => router.push('/flights')} 
          className="border border-primary text-primary px-10 py-4 font-label text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all"
        >
          Return to Search
        </button>
      </main>
    );
  }

  const renderSeat = (seat) => {
    const isSelected = selectedSeatNumbers.includes(seat.seat_number);
    return (
      <button
        key={seat.seat_number}
        type="button"
        onClick={() => handleSeatClick(seat)}
        disabled={!seat.is_available}
        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[10px] font-bold transition-all duration-300 rounded-sm relative group ${
          !seat.is_available
            ? 'bg-outline-variant/10 text-outline/20 cursor-not-allowed'
            : isSelected
              ? 'bg-secondary text-on-secondary shadow-lg shadow-secondary/20 z-10'
              : 'bg-surface-container-low border border-outline-variant/20 hover:border-secondary text-primary'
        }`}
      >
        {seat.seat_number}
        {seat.extra_charge > 0 && !isSelected && (
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-secondary"></div>
        )}
      </button>
    );
  };

  return (
    <main className="pt-24 md:pt-40 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-20">
        
        <div className="flex-grow">
          <header className="mb-16">
            <span className="text-secondary font-label text-xs font-bold uppercase tracking-[0.4em] block mb-6">Step 03 — Select Seats</span>
            <h1 className="font-headline text-5xl tracking-tight text-primary leading-tight mb-8">
              Select Your <span className="italic font-light">Seat.</span>
            </h1>
            <div className="p-6 bg-surface-container-low border border-outline-variant/10 flex items-center gap-8 text-sm font-light text-on-surface-variant">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-surface-container-low border border-outline-variant/20"></div>
                 <span>Available</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-outline-variant/10"></div>
                 <span>Occupied</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-secondary"></div>
                 <span>Selected</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-secondary"></div>
                 <span>Premium</span>
               </div>
            </div>
          </header>

          {loading ? (
             <div className="py-20 text-center text-outline-variant font-label tracking-widest uppercase text-xs">Loading Cabin Map...</div>
          ) : (
            <div className="bg-surface-container-lowest p-12 editorial-shadow border border-outline-variant/5 rounded-t-[100px] flex flex-col items-center">
              <div className="w-24 h-4 bg-outline-variant/10 rounded-full mb-12"></div>
              
              {businessSeats.length > 0 && (
                <section className="mb-16 w-full max-w-sm">
                  <h2 className="text-center font-label text-[10px] uppercase tracking-[0.4em] text-outline mb-10">Business Class</h2>
                  <div className="grid grid-cols-4 gap-4 place-items-center">
                    {businessSeats.map(renderSeat)}
                  </div>
                </section>
              )}

              <div className="w-full flex items-center gap-4 mb-16">
                 <div className="h-px flex-grow bg-outline-variant/10"></div>
                 <span className="font-label text-[9px] uppercase tracking-widest text-outline-variant">Main Cabin Begins</span>
                 <div className="h-px flex-grow bg-outline-variant/10"></div>
              </div>

              <section className="w-full max-w-sm">
                <div className="grid grid-cols-6 gap-x-2 gap-y-4 place-items-center">
                  {economySeats.map((seat, i) => (
                    <Fragment key={seat.seat_number || i}>
                      {renderSeat(seat)}
                      {/* Add aisle */}
                      {(i + 1) % 6 === 3 && <div key={`aisle-${i}`} className="w-4"></div>}
                    </Fragment>
                  ))}
                </div>
              </section>

              <div className="mt-20 w-16 h-1 border-b-2 border-outline-variant/20"></div>
            </div>
          )}
        </div>

        <aside className="lg:w-96 text-primary">
          <div className="sticky top-32 space-y-10">
            <div className="bg-surface-container-low p-10 editorial-shadow space-y-8">
              <h3 className="font-headline text-2xl">Trip Summary</h3>
              
              <div className="space-y-4">
                <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest">Flight</p>
                <div className="flex justify-between items-end">
                  <p className="font-headline text-xl">{selectedFlight.origin} → {selectedFlight.destination}</p>
                  <p className="text-sm font-light text-on-surface-variant font-body">{selectedFlight.flight_number}</p>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-outline-variant/10">
                <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest">Selected Fare</p>
                <div className="flex justify-between items-end">
                  <p className="font-headline text-xl">{selectedFare?.name || 'Standard'}</p>
                  <p className="text-sm font-light text-on-surface-variant font-body">₹{selectedFare?.price?.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-outline-variant/20">
                <p className="text-xs font-label text-on-surface-variant uppercase tracking-widest">
                  Selected Seats ({selectedSeatNumbers.length}/{requiredSeats})
                </p>
                <div className="flex flex-wrap gap-4 items-end">
                  {selectedSeatNumbers.length > 0 ? (
                    selectedSeatNumbers.map((num, idx) => (
                      <div key={num} className="flex flex-col">
                        <span className="text-[10px] text-outline uppercase font-bold">Traveler {idx + 1}</span>
                        <p className="font-headline text-3xl text-secondary">{num}</p>
                      </div>
                    ))
                  ) : (
                    <p className="font-headline text-3xl text-secondary">--</p>
                  )}
                  {infants > 0 && (
                    <div className="flex flex-col ml-auto">
                        <span className="text-[10px] text-outline uppercase font-bold">{infants} Infant{infants > 1 ? 's' : ''}</span>
                        <p className="font-label text-xs text-secondary/60 italic uppercase tracking-widest">In-Lap</p>
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={handleContinue}
                disabled={selectedSeatNumbers.length < requiredSeats}
                className="w-full bg-primary text-white py-5 font-label text-[10px] font-black uppercase tracking-[0.3em] hover:bg-secondary hover:text-on-secondary-fixed-variant transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {selectedSeatNumbers.length < requiredSeats ? `Select ${requiredSeats - selectedSeatNumbers.length} more` : 'Proceed to Details'}
              </button>
            </div>

            <div className="border border-outline-variant/10 p-8 flex items-start gap-4">
               <span className="material-symbols-outlined text-secondary">info</span>
               <p className="text-[11px] leading-relaxed text-on-surface-variant font-light">
                 Seats are held for 10 minutes from the time of selection. Please complete your registration to finalize the booking.
               </p>
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}

