'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';
import { flightApi } from '@/lib/flightApi';

export default function FlightResultsPage() {
  const router = useRouter();
  const setSearchQuery = useBookingStore((s) => s.setSearchQuery);
  const searchQuery = useBookingStore((s) => s.searchQuery);
  const setSelectedFlight = useBookingStore((s) => s.setSelectedFlight);

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const urlDate = p.get('date') || '';
    
    // Only proceed if the URL actually has a date — otherwise the user navigated here incorrectly
    if (!urlDate) {
      setLoading(false);
      setError('No departure date provided. Please search again.');
      return;
    }

    setSearchQuery({
      origin: p.get('origin') || '',
      destination: p.get('destination') || '',
      departureDate: urlDate,
      date: urlDate,
      adults: Number(p.get('adults') || 1),
      children: Number(p.get('children') || 0),
      infants: Number(p.get('infants') || 0),
      cabinClass: p.get('class') || 'ECONOMY',
      tripType: 'one_way',
    });
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const origin = (searchQuery?.origin || '').toUpperCase();
  const dest = (searchQuery?.destination || '').toUpperCase();
  const date = searchQuery?.departureDate || searchQuery?.date || '';
  const adults = searchQuery?.adults || 1;
  const children = searchQuery?.children || 0;
  const infants = searchQuery?.infants || 0;
  const totalPax = adults + children + infants;
  const cls = searchQuery?.cabinClass || 'ECONOMY';

  useEffect(() => {
    if (!ready) return;
    if (!origin || !dest || !date) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await flightApi.searchFlights({
          origin,
          destination: dest,
          departure_date: date,
          passengers: totalPax,
          class: cls,
        });
        if (!cancelled) setFlights(Array.isArray(res) ? res : []);
      } catch (err) {
        if (!cancelled) {
          const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch flights.';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [ready, origin, dest, date, totalPax, cls]);

  const fmt = (iso) => {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fmtDate = (d) => {
    if (!d) return '';
    try { return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); }
    catch { return d; }
  };

  const handleSelect = (flight) => {
    setSelectedFlight(flight);
    router.push('/flights/fare-selection');
  };

  return (
    <main className="min-h-screen bg-surface">
        <div className="bg-primary text-white">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-4 mt-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-headline text-xl">{origin}</span>
              <span className="material-symbols-outlined text-white/40 text-base">arrow_forward</span>
              <span className="font-headline text-xl">{dest}</span>
              <span className="text-white/30 mx-2">|</span>
              <span className="text-sm text-white/70">{fmtDate(date)}</span>
              <span className="text-white/30 mx-2">|</span>
              <span className="text-sm text-white/70">{totalPax} traveler{totalPax > 1 ? 's' : ''}</span>
              <span className="text-white/30 mx-2">|</span>
              <span className="text-sm text-white/70">{cls.charAt(0) + cls.slice(1).toLowerCase()}</span>
            </div>
            <button
              onClick={() => router.push('/flights')}
              className="flex items-center gap-1.5 text-secondary text-xs font-bold uppercase tracking-wider hover:text-white transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Modify Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          <aside className="lg:w-[260px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-xl border border-outline-variant/10 p-5 shadow-sm">
                <h3 className="font-label text-[10px] uppercase tracking-wider font-bold text-outline mb-4">Filters</h3>

                <div>
                  <p className="text-xs font-semibold text-primary mb-2.5">Stops</p>
                  <div className="space-y-2">
                    {['Non-stop', '1 Stop', '2+ Stops'].map((s) => (
                      <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" />
                        <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-xs font-semibold text-primary mb-2.5">Price Range</p>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    defaultValue="100000"
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-outline mt-1">
                    <span>₹0</span>
                    <span>₹1,00,000</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-primary mb-2.5">Airlines</p>
                  <div className="space-y-2">
                    {['All Airlines', 'IndiGo', 'Air India', 'Vistara'].map((a) => (
                      <label key={a} className="flex items-center gap-2.5 cursor-pointer group">
                        <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer" />
                        <span className="text-sm text-on-surface-variant group-hover:text-primary transition-colors">{a}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                <img src="/images/first_class.png" alt="Premium cabin" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5">
                  <span className="text-secondary text-[9px] font-bold uppercase tracking-wider">Featured</span>
                  <h4 className="text-white font-headline text-lg mt-1">Premium Cabin Upgrade</h4>
                  <p className="text-white/50 text-xs mt-1">Experience world-class comfort</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-headline text-2xl text-primary">
                  {loading ? 'Searching flights...' : `${flights.length} flight${flights.length !== 1 ? 's' : ''} found`}
                </h1>
                {!loading && flights.length > 0 && (
                  <p className="text-sm text-on-surface-variant mt-1">Sorted by lowest fare</p>
                )}
              </div>
              {!loading && flights.length > 0 && (
                <select className="text-xs border border-outline-variant/20 rounded-lg px-3 py-2 bg-white text-primary focus:ring-1 focus:ring-secondary focus:outline-none cursor-pointer">
                  <option>Price: Low to High</option>
                  <option>Duration: Shortest</option>
                  <option>Departure: Earliest</option>
                </select>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-outline-variant/10 p-6 animate-pulse">
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 rounded-full bg-surface-container" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-surface-container rounded w-1/3" />
                        <div className="h-3 bg-surface-container-low rounded w-1/5" />
                      </div>
                      <div className="h-6 bg-surface-container rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl border border-error/10 p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-error/60 mb-3 block">error_outline</span>
                <p className="text-primary font-medium mb-1">Something went wrong</p>
                <p className="text-sm text-on-surface-variant mb-6">{error}</p>
                <button
                  onClick={() => router.push('/flights')}
                  className="text-secondary text-xs font-bold uppercase tracking-wider hover:underline"
                >
                  Try a new search
                </button>
              </div>
            ) : flights.length === 0 ? (
              <div className="bg-white rounded-xl border border-outline-variant/10 p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-outline/40 mb-3 block">flight_land</span>
                <p className="text-primary font-medium mb-1">No flights available</p>
                <p className="text-sm text-on-surface-variant">Try changing your dates or route.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {flights.map((flight, idx) => {
                  const cheapest = flight.fares?.length > 0
                    ? flight.fares.reduce((m, c) => (c.price < m.price ? c : m), flight.fares[0])
                    : null;
                  const durH = Math.floor((flight.duration_minutes || 0) / 60);
                  const durM = (flight.duration_minutes || 0) % 60;
                  const duration = durH > 0 ? `${durH}h ${durM}m` : `${durM}m`;

                  return (
                    <div
                      key={flight.instance_id || idx}
                      className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md hover:border-secondary/30 cursor-pointer group ${
                        idx === 0 ? 'border-secondary/20 ring-1 ring-secondary/5' : 'border-outline-variant/10'
                      }`}
                      onClick={() => handleSelect(flight)}
                    >
                      {idx === 0 && (
                        <div className="bg-secondary/5 px-5 py-1.5 rounded-t-xl border-b border-secondary/10 flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-xs" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                          <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Best value</span>
                        </div>
                      )}

                      <div className="p-5 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
                          <div className="flex items-center gap-4 md:gap-6 flex-1">
                            {/* Airline Icon */}
                            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-primary text-lg">flight</span>
                            </div>

                            <div className="text-center min-w-[60px]">
                              <p className="text-lg font-headline text-primary leading-tight">{fmt(flight.departure_time)}</p>
                              <p className="text-[10px] text-outline uppercase tracking-wider font-bold">{flight.origin}</p>
                            </div>

                            <div className="flex-1 flex flex-col items-center px-2 md:px-6">
                              <span className="text-[10px] text-outline mb-1.5">{duration}</span>
                              <div className="w-full h-px bg-outline-variant/30 relative">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-outline-variant/40" />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-outline-variant/40" />
                              </div>
                              <span className="text-[10px] text-outline mt-1.5">Non-stop</span>
                            </div>

                            <div className="text-center min-w-[60px]">
                              <p className="text-lg font-headline text-primary leading-tight">{fmt(flight.arrival_time)}</p>
                              <p className="text-[10px] text-outline uppercase tracking-wider font-bold">{flight.destination}</p>
                            </div>
                          </div>

                          <div className="md:w-[120px] md:text-center md:border-l md:border-outline-variant/10 md:ml-6 md:pl-6">
                            <p className="text-xs text-on-surface-variant">{flight.airline_name || 'Airline'}</p>
                            <p className="text-[10px] text-outline mt-0.5">{flight.flight_number || ''}</p>
                          </div>

                          <div className="flex items-center gap-4 md:w-[180px] md:justify-end md:border-l md:border-outline-variant/10 md:ml-6 md:pl-6">
                            <div className="text-right">
                              <p className="font-headline text-xl text-primary">₹{cheapest?.price?.toLocaleString() || '—'}</p>
                              <p className="text-[10px] text-outline">per person</p>
                              {flight.fares?.length > 1 && (
                                <p className="text-[10px] text-secondary font-bold mt-0.5">{flight.fares.length} fares</p>
                              )}
                            </div>
                            <button
                              className="bg-primary text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-secondary hover:text-primary transition-all shrink-0"
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
