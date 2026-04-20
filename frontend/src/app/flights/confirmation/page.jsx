'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useBookingStore, useAuthStore } from '@/lib/store';
import { flightApi } from '@/lib/flightApi';

export default function ConfirmationPage() {
  const router = useRouter();
  const activeBooking = useBookingStore(state => state.activeBooking);
  const selectedFlight = useBookingStore(state => state.selectedFlight);
  const user = useAuthStore(state => state.user);
  const clearBookingFlow = useBookingStore(state => state.clearBookingFlow);

  const [eTicket, setETicket] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(false);

  const handleGetTicket = async () => {
    if (!activeBooking?.id) return;
    setTicketLoading(true);
    try {
      const ticket = await flightApi.getETicket(activeBooking.id);
      setETicket(ticket);
    } catch (err) {
      console.error('Failed to fetch e-ticket:', err);
    } finally {
      setTicketLoading(false);
    }
  };

  const handleNewSearch = () => {
    clearBookingFlow();
    router.push('/flights');
  };

  if (!activeBooking || !selectedFlight) {
    return (
      <main className="pt-32 px-6 md:px-12 max-w-[900px] mx-auto text-center">
        <h1 className="text-4xl font-headline text-primary mb-6">Reservation Not Found</h1>
        <p className="text-on-surface-variant mb-12 font-light">We were unable to locate an active booking session.</p>
        <button onClick={() => router.push('/flights')} className="bg-primary text-white px-10 py-4 font-label text-xs uppercase tracking-widest">
          Start New Search
        </button>
      </main>
    );
  }

  const primaryPassenger = activeBooking.passengers?.[0] || { first_name: user?.name?.split(' ')[0] || 'Traveler' };
  const departureTime = selectedFlight?.departure_time
    ? new Date(selectedFlight.departure_time).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  return (
    <main className="pt-24 md:pt-40 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto">

      <section className="flex flex-col lg:flex-row items-start gap-16 md:gap-24 mb-24">
        <div className="w-full lg:w-3/5 space-y-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
            </div>
            <span className="font-label text-[10px] uppercase tracking-[0.4em] font-black text-secondary">Reservation Confirmed</span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl tracking-tight text-primary leading-tight">
            Safe Travels,<br /><span className="italic font-light">{primaryPassenger.first_name}.</span>
          </h1>
          <p className="font-body text-on-surface-variant max-w-xl text-lg font-light leading-relaxed">
            Your reservation is successfully confirmed. A confirmation has been dispatched to{' '}
            <span className="font-semibold text-primary">{user?.email || 'your registered email'}</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {eTicket ? (
              <a
                href={eTicket.qr_code_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-primary text-secondary px-10 py-5 font-label text-[9px] uppercase tracking-[0.3em] font-black hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-lg">qr_code</span>
                Download Ticket {eTicket.ticket_number}
              </a>
            ) : (
              <button
                onClick={handleGetTicket}
                disabled={ticketLoading}
                className="flex items-center gap-3 bg-primary text-secondary px-10 py-5 font-label text-[9px] uppercase tracking-[0.3em] font-black hover:brightness-110 transition-all disabled:opacity-50"
              >
                {ticketLoading ? (
                  <div className="w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-lg">download</span>
                )}
                {ticketLoading ? 'Fetching...' : 'Get E-Ticket'}
              </button>
            )}
            <button
              onClick={() => router.push(`/flights/status/${activeBooking.pnr}`)}
              className="flex items-center gap-3 border border-primary/20 text-primary px-10 py-5 font-label text-[9px] uppercase tracking-[0.3em] font-black hover:bg-primary/5 transition-all"
            >
              <span className="material-symbols-outlined text-lg">radar</span>
              Track Live Path
            </button>
            <button
              onClick={handleNewSearch}
              className="text-outline font-label text-[9px] uppercase tracking-[0.3em] font-black border-b border-outline/30 pb-0.5 hover:text-primary transition-colors self-center"
            >
              New Search
            </button>
          </div>
        </div>
        
        <div className="w-full lg:w-2/5">
          <div className="bg-surface-container-lowest editorial-shadow p-12 lg:p-16 flex flex-col items-center justify-center space-y-6 text-center border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
              <span className="material-symbols-outlined text-[15rem]">confirmation_number</span>
            </div>
            <span className="font-label text-[9px] uppercase tracking-[0.4em] text-outline font-black">Global Booking Reference</span>
            <div className="font-headline text-6xl md:text-7xl text-primary tracking-[0.15em] font-light uppercase">
              {activeBooking.pnr || 'TNEO'}
            </div>
            <div className="w-16 h-px bg-secondary"></div>
            <p className="text-[10px] uppercase tracking-widest text-outline-variant font-label">Valid across all partner terminals</p>
            {activeBooking.seat_class && (
              <div className="bg-secondary/10 px-6 py-2 mt-2">
                <span className="text-[9px] font-label font-black uppercase tracking-widest text-secondary">{activeBooking.seat_class} · {activeBooking.trip_type?.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>
      </section>

        <section className="mb-20">
          <div className="flex items-end justify-between border-b border-outline-variant/10 pb-6 mb-10">
            <h2 className="text-3xl font-headline text-primary">Trip Summary</h2>
          </div>
          <div className="bg-surface-container-low p-10 md:p-16 border border-outline-variant/5 editorial-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/5 to-transparent pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16">
              <div className="text-center md:text-left">
                <div className="font-headline text-6xl text-primary leading-none tracking-tighter mb-3">{selectedFlight?.origin}</div>
                <div className="font-label text-[9px] uppercase tracking-[0.4em] text-outline font-black">Departure</div>
              </div>
              <div className="flex-grow w-full max-w-xs relative flex items-center justify-center opacity-20">
                <div className="w-full h-px border-t border-dashed border-primary"></div>
                <span className="material-symbols-outlined absolute bg-surface-container-low px-6 text-primary">flight</span>
              </div>
              <div className="text-center md:text-right">
                <div className="font-headline text-6xl text-primary leading-none tracking-tighter mb-3">{selectedFlight?.destination}</div>
                <div className="font-label text-[9px] uppercase tracking-[0.4em] text-outline font-black">Arrival</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-10 border-t border-outline-variant/10">
              <div>
                <span className="font-label text-[9px] uppercase tracking-[0.3em] text-outline block mb-2 font-black">Flight Number</span>
                <span className="font-headline text-2xl text-primary uppercase">{selectedFlight?.flight_number}</span>
              </div>
              <div>
                <span className="font-label text-[9px] uppercase tracking-[0.3em] text-outline block mb-2 font-black">Departure</span>
                <span className="font-headline text-2xl text-primary">{departureTime}</span>
              </div>
              <div>
                <span className="font-label text-[9px] uppercase tracking-[0.3em] text-outline block mb-2 font-black">Total Paid</span>
                <span className="font-headline text-2xl text-primary">₹{activeBooking.total_amount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-label text-[9px] uppercase tracking-[0.3em] text-outline block mb-2 font-black">Status</span>
                <span className="text-secondary font-black text-[9px] uppercase tracking-[0.3em] bg-secondary/10 px-3 py-1.5 inline-block">Confirmed</span>
              </div>
            </div>
          </div>
        </section>

      <section>
        <div className="flex items-end justify-between border-b border-outline-variant/10 pb-6 mb-10">
          <h2 className="text-3xl font-headline text-primary">Traveler Details</h2>
          <span className="font-label text-[9px] uppercase tracking-[0.4em] text-outline font-black">{activeBooking.passengers?.length} Traveler{activeBooking.passengers?.length !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBooking.passengers?.map((p, idx) => (
            <div key={idx} className="bg-surface-container-low p-8 border border-outline-variant/5 editorial-shadow flex items-center justify-between group hover:bg-surface-bright transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center font-headline text-lg uppercase group-hover:bg-secondary group-hover:text-white transition-colors">
                  {p.first_name?.[0]}{p.last_name?.[0]}
                </div>
                <div>
                  <p className="font-headline text-lg text-primary leading-tight">{p.first_name} {p.last_name}</p>
                  <p className="text-[9px] uppercase tracking-widest text-outline mt-1 font-black">{p.passenger_type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-outline mb-1 font-black">Seat</p>
                <p className="font-headline text-lg text-secondary tracking-wider">
                  {p.passenger_type === 'infant' ? 'LAP' : (p.seat_number || 'OK')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
