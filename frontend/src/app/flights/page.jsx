'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store';

export default function FlightSearchPage() {
  const router = useRouter();
  const setSearchQuery = useBookingStore(state => state.setSearchQuery);

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState('ECONOMY');
  const [showPax, setShowPax] = useState(false);
  const [validationError, setValidationError] = useState('');

  const paxRef = useRef(null);

  // Close pax dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (paxRef.current && !paxRef.current.contains(e.target)) {
        setShowPax(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalPax = adults + children + infants;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSearch = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!origin.trim()) {
      setValidationError('Please enter an origin airport code.');
      return;
    }
    if (!destination.trim()) {
      setValidationError('Please enter a destination airport code.');
      return;
    }
    if (!departureDate) {
      setValidationError('Please select a departure date.');
      return;
    }

    setSearchQuery({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      date: departureDate,
      adults,
      children,
      infants,
      cabinClass,
      tripType: 'one_way',
    });

    router.push(
      `/flights/results?origin=${origin.toUpperCase()}&destination=${destination.toUpperCase()}&adults=${adults}&children=${children}&infants=${infants}&class=${cabinClass}&date=${departureDate}`
    );
  };

  const PaxCounter = ({ label, sublabel, value, onChange, min = 0, max = 9 }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="text-xs text-outline">{sublabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-outline-variant/40 flex items-center justify-center text-sm text-primary hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary disabled:hover:border-outline-variant/40 transition-all"
        >
          −
        </button>
        <span className="w-6 text-center font-semibold text-primary tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border border-outline-variant/40 flex items-center justify-center text-sm text-primary hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary disabled:hover:border-outline-variant/40 transition-all"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <main>
      <section className="relative h-[100svh] min-h-[640px] max-h-[1000px] flex items-end">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            alt="Dramatic aerial view of a commercial jet at sunset"
            src="/images/hero_dramatic_jet.png"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6 md:px-12 pb-10 md:pb-16">
          <div className="mb-10 md:mb-14">
            <p className="font-label text-[10px] text-secondary font-bold uppercase tracking-[0.4em] mb-4">
              Tripneo · Premium Travel
            </p>
            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.05]">
              Where will you<br />
              <span className="italic font-light">go next?</span>
            </h1>
          </div>

          <form
            onSubmit={handleSearch}
            className="bg-white rounded-xl shadow-2xl shadow-black/20 p-3 md:p-4"
          >
            {validationError && (
              <div className="mb-3 px-4 py-2.5 bg-error/5 border border-error/10 rounded-lg">
                <p className="text-error text-xs font-medium">{validationError}</p>
              </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-0">
              <div className="flex-1 px-4 py-3 rounded-lg hover:bg-surface-container-low transition-colors group lg:border-r lg:border-outline-variant/20 lg:rounded-none">
                <label className="block text-[10px] text-outline uppercase tracking-wider font-bold mb-0.5">From</label>
                <input
                  type="text"
                  placeholder="City or airport"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  className="w-full bg-transparent border-none p-0 text-primary font-headline text-lg placeholder:text-outline-variant/60 focus:ring-0 focus:outline-none uppercase"
                  maxLength={3}
                />
              </div>

              <button
                type="button"
                onClick={() => { const t = origin; setOrigin(destination); setDestination(t); }}
                className="hidden lg:flex items-center justify-center w-9 h-9 -mx-[18px] z-10 bg-white border border-outline-variant/30 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined text-base">swap_horiz</span>
              </button>

              <div className="flex-1 px-4 py-3 rounded-lg hover:bg-surface-container-low transition-colors group lg:border-r lg:border-outline-variant/20 lg:rounded-none">
                <label className="block text-[10px] text-outline uppercase tracking-wider font-bold mb-0.5">To</label>
                <input
                  type="text"
                  placeholder="City or airport"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  className="w-full bg-transparent border-none p-0 text-primary font-headline text-lg placeholder:text-outline-variant/60 focus:ring-0 focus:outline-none uppercase"
                  maxLength={3}
                />
              </div>

              <div className="flex-1 px-4 py-3 rounded-lg hover:bg-surface-container-low transition-colors group lg:border-r lg:border-outline-variant/20 lg:rounded-none">
                <label className="block text-[10px] text-outline uppercase tracking-wider font-bold mb-0.5">Departure</label>
                <input
                  type="date"
                  value={departureDate}
                  min={todayStr}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full bg-transparent border-none p-0 text-primary font-body text-sm focus:ring-0 focus:outline-none cursor-pointer"
                />
              </div>

              <div className="relative flex-1" ref={paxRef}>
                <button
                  type="button"
                  onClick={() => setShowPax(!showPax)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-surface-container-low transition-colors group lg:border-r lg:border-outline-variant/20 lg:rounded-none text-left"
                >
                  <span className="material-symbols-outlined text-xl text-secondary">person</span>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] text-outline uppercase tracking-wider font-bold mb-0.5">Travelers</span>
                    <span className="block text-primary font-body text-sm truncate">
                      {totalPax} traveler{totalPax > 1 ? 's' : ''} · {cabinClass.charAt(0) + cabinClass.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <span className={`material-symbols-outlined text-sm text-outline transition-transform ${showPax ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {showPax && (
                  <div className="absolute top-full left-0 right-0 lg:left-auto lg:right-0 lg:w-[320px] mt-2 bg-white rounded-xl shadow-2xl shadow-black/10 border border-outline-variant/10 z-50 p-5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-1">
                      <PaxCounter label="Adults" sublabel="12+ years" value={adults} onChange={setAdults} min={1} />
                      <PaxCounter label="Children" sublabel="2–11 years" value={children} onChange={setChildren} />
                      <PaxCounter label="Infants" sublabel="Under 2 years" value={infants} onChange={setInfants} max={adults} />
                    </div>

                    <div className="mt-4 pt-4 border-t border-outline-variant/10">
                      <p className="text-[10px] text-outline uppercase tracking-wider font-bold mb-2.5">Cabin Class</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['ECONOMY', 'BUSINESS', 'FIRST'].map(cls => (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => setCabinClass(cls)}
                            className={`py-2 rounded-md text-[10px] uppercase tracking-wider font-bold transition-all ${
                              cabinClass === cls
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-surface-container-low text-outline hover:text-primary hover:bg-surface-container'
                            }`}
                          >
                            {cls === 'FIRST' ? 'First' : cls.charAt(0) + cls.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPax(false)}
                      className="w-full mt-4 bg-primary text-white py-2.5 rounded-lg font-label text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-primary px-8 py-4 lg:py-3 rounded-lg font-label text-xs font-bold uppercase tracking-wider transition-all lg:ml-2 shrink-0"
              >
                <span className="material-symbols-outlined text-lg">search</span>
                <span className="lg:hidden xl:inline">Search</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6 md:px-12 max-w-[1280px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-14">
          <div>
            <span className="text-secondary font-label text-[10px] font-bold uppercase tracking-[0.3em] block mb-3">Popular Destinations</span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary">Explore the world with Tripneo</h2>
          </div>
          <button className="text-primary font-label text-xs font-semibold flex items-center gap-1.5 group border-b border-primary/20 pb-0.5 hover:border-primary transition-colors">
            View All
            <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">east</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { city: 'Kyoto', country: 'Japan', price: '₹42,800', img: '/images/kyoto.png' },
            { city: 'Amalfi', country: 'Italy', price: '₹58,200', img: '/images/amalfi.png' },
            { city: 'London', country: 'United Kingdom', price: '₹36,400', img: '/images/london.png' },
            { city: 'New York', country: 'United States', price: '₹52,100', img: '/images/newyork.png' },
          ].map((dest) => (
            <div key={dest.city} className="group cursor-pointer">
              <div className="aspect-[3/4] overflow-hidden rounded-xl mb-4 relative">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={dest.city}
                  src={dest.img}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-headline text-2xl text-white mb-0.5">{dest.city}</h3>
                  <p className="text-white/70 text-xs">{dest.country}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-on-surface-variant">Starting from</span>
                <span className="font-headline text-lg text-primary">{dest.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary text-white py-20 md:py-28">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="font-label text-secondary font-bold text-[10px] uppercase tracking-[0.4em] mb-3 block">Why Tripneo</span>
            <h2 className="font-headline text-3xl md:text-4xl">Seamless flight booking</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: 'restaurant', title: 'Gourmet Meals', desc: 'Premium menus adapted for in-flight, featuring seasonal ingredients from your route\u2019s regions.' },
              { icon: 'bed', title: 'Lie-Flat Suites', desc: 'Private suites with Italian linens, acoustic isolation, and intuitive wellness lighting systems.' },
              { icon: 'shield', title: 'Secure Booking', desc: 'End-to-end encrypted transactions with real-time seat locking and instant confirmation.' },
            ].map((f) => (
              <div key={f.title} className="text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 mx-auto md:mx-0">
                  <span className="material-symbols-outlined text-secondary text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-headline text-xl mb-3">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-secondary font-label text-[10px] font-bold uppercase tracking-[0.3em] block mb-3">Elite Membership</span>
              <h2 className="font-headline text-3xl md:text-4xl text-primary mb-6">Rewards at every altitude</h2>
              <p className="text-on-surface-variant leading-relaxed mb-8">
                Join Tripneo Elite for priority boarding, lounge access across 1,200+ airports, and personalized travel concierge available 24/7.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  'Priority booking on partner airlines',
                  'Universal premium lounge access',
                  '24/7 dedicated travel concierge',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                    <span className="text-sm text-on-surface-variant">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="bg-primary text-white px-8 py-3.5 rounded-lg font-label text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors">
                Learn More
              </button>
            </div>

            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-primary to-[#0a1a2a] aspect-[1.6/1] w-full max-w-md rounded-2xl p-8 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -right-16 -bottom-16 w-56 h-56 border border-secondary/20 rounded-full" />
                <div className="absolute -right-8 -bottom-8 w-56 h-56 border border-secondary/10 rounded-full" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="font-headline text-xl italic">Tripneo</span>
                    <span className="block font-label text-[9px] uppercase tracking-[0.3em] opacity-50 mt-0.5">Concierge Elite</span>
                  </div>
                  <span className="material-symbols-outlined text-3xl opacity-30">contactless</span>
                </div>
                <div className="relative z-10">
                  <div className="font-headline text-lg tracking-[0.15em] mb-4 opacity-80">4402 • 1928 • 8832 • 0092</div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider opacity-40 mb-0.5">Cardholder</span>
                      <span className="text-sm font-medium tracking-wide">VALUED MEMBER</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] uppercase tracking-wider opacity-40 mb-0.5">Valid Thru</span>
                      <span className="text-sm font-medium">12/28</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 px-6 md:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <span className="material-symbols-outlined text-secondary text-4xl mb-5 block">mail</span>
          <h2 className="font-headline text-3xl text-primary mb-4">Stay inspired</h2>
          <p className="text-on-surface-variant mb-8 leading-relaxed">
            Join our mailing list for exclusive destination guides and early access to curated travel collections.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              className="flex-1 bg-surface-container-low border border-outline-variant/30 px-5 py-3 rounded-lg text-sm focus:ring-1 focus:ring-secondary focus:outline-none"
              placeholder="Email address"
              type="email"
            />
            <button className="bg-primary text-white px-6 py-3 rounded-lg font-label text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors shrink-0">
              Subscribe
            </button>
          </div>
          <p className="mt-4 text-[10px] text-outline">No spam. Only inspiration.</p>
        </div>
      </section>
    </main>
  );
}
