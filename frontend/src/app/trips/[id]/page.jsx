'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Plane, MapPin, 
  Calendar, Clock, User, Download, 
  XCircle, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { flightApi } from '@/lib/flightApi';
import { useAuthStore } from '@/lib/store';

export default function TicketDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const user = useAuthStore(state => state.user);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await flightApi.getBookingById(id);
        setBooking(res.data || res);
      } catch (err) {
        console.error("Fetch Booking Error:", err);
        setError("Unable to retrieve booking details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  const initiateCancel = () => setShowCancelModal(true);

  const confirmCancel = async () => {
    setShowCancelModal(false);
    setIsCancelling(true);
    try {
      await flightApi.cancelBooking(id);
      const res = await flightApi.getBookingById(id);
      setBooking(res.data || res);
    } catch (err) {
      console.error("Cancel Error:", err);
      alert(err.response?.data?.message || "Cancellation failed.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={48} />
    </div>
  );

  if (error || !booking) return (
    <div className="min-h-screen bg-slate-50 pt-32 px-6 text-center">
      <h2 className="text-3xl font-black text-slate-800 mb-4">Error</h2>
      <p className="text-slate-500 mb-8">{error || "Booking not found"}</p>
      <Link href="/trips" className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold">Back to My Trips</Link>
    </div>
  );

  const flightDate = new Date(booking.departure_time);
  const bookingStatus = booking.status || 'PENDING';
  const normalizedBookingStatus = bookingStatus.toUpperCase();
  const pnr = booking.pnr || 'PENDING';
  const seatClass = booking.seat_class || 'ECONOMY';
  const canTrack = normalizedBookingStatus === 'CONFIRMED' && Boolean(booking.pnr);
  const refundStatus = booking.refund_status || null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const formatStatusLabel = (s) => s.charAt(0) + s.slice(1).toLowerCase();

  return (
    <div className="min-h-screen bg-slate-100 pt-24 pb-20 px-4 md:px-8 flex justify-center items-start">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        
        <div className="flex items-center justify-between">
            <Link href="/trips" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors">
                <ChevronLeft size={20} /> Back to Trips
            </Link>
            <div className="flex items-center gap-3">
                {(normalizedBookingStatus === "CONFIRMED" || normalizedBookingStatus === "PENDING") && (
                    <button 
                        disabled={isCancelling}
                        onClick={initiateCancel}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2 transition-colors border border-rose-200 shadow-sm disabled:opacity-50"
                    >
                        {isCancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                        Cancel Booking
                    </button>
                )}
                {normalizedBookingStatus === "CONFIRMED" && (
                    <button className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold py-2 px-4 rounded-full text-sm flex items-center gap-2 transition-colors border border-emerald-200 shadow-sm">
                        <Download size={16} /> Download PDF
                    </button>
                )}
            </div>
        </div>

        <div className={`rounded-2xl border p-5 ${normalizedBookingStatus === 'CANCELLED' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Booking Status</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  normalizedBookingStatus === 'CANCELLED' ? 'bg-rose-100 text-rose-700' : normalizedBookingStatus === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {formatStatusLabel(bookingStatus)}
                </span>
                {refundStatus && (
                  <span className="bg-white/50 px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 border border-slate-200/50 uppercase tracking-wider">
                    Refund: {formatStatusLabel(refundStatus)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 text-right sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Total Paid</p>
                <p className={`text-2xl font-black ${normalizedBookingStatus === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{formatCurrency(booking.total_amount)}</p>
              </div>
              
              {normalizedBookingStatus === 'CANCELLED' && booking.refund_amount !== undefined && (
                <div className="pl-6 border-l border-rose-200">
                  <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-1">Refund Amount</p>
                  <p className="text-2xl font-black text-rose-600">{formatCurrency(booking.refund_amount)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
            {booking.passengers?.map((passenger, idx) => (
                <motion.div 
                    key={passenger.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-xl flex flex-col md:flex-row border border-slate-100"
                >
                    <div className="flex-grow p-8 md:p-10">
                        <div className="flex justify-between items-start mb-10">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Boarding Pass</span>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">TRIP<span className="text-emerald-500">neo</span></h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Flight No</p>
                                <p className="font-black text-slate-900">{booking.flight_number || 'TBA'}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-6 mb-10">
                            <div className="flex-1">
                                <p className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-1">{booking.origin}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{booking.origin_city || 'Origin'}</p>
                            </div>
                            <div className="flex flex-col items-center gap-2 px-4 opacity-30">
                                <Plane className="text-emerald-500 rotate-90" size={20} />
                                <div className="w-16 md:w-24 h-px bg-slate-300 relative">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300" />
                                </div>
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-1">{booking.destination}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{booking.destination_city || 'Destination'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Passenger</p>
                                <p className="font-bold text-slate-900 uppercase truncate">{passenger.first_name} {passenger.last_name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                                <p className="font-bold text-slate-900">{flightDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Boarding</p>
                                <p className="font-bold text-slate-900">{flightDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PNR</p>
                                <p className="font-black text-emerald-600">{pnr}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 text-white w-full md:w-[180px] p-8 md:p-10 border-t md:border-t-0 md:border-l border-dashed border-slate-700 relative">
                        <div className="hidden md:block absolute -left-3 top-0 bottom-0 w-6 flex flex-col justify-between py-10 z-10">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="w-2 h-2 rounded-full bg-slate-100 -ml-1" />
                            ))}
                        </div>
                        <div className="flex flex-col justify-between h-full space-y-8 md:space-y-0">
                            <div className="text-center md:text-left">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seat</p>
                                <p className="text-4xl font-black">{passenger.seat_number || 'TBA'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Class</p>
                                <p className="font-bold">{seatClass}</p>
                            </div>
                            <div className="pt-6 border-t border-slate-700/50">
                                <div className="flex justify-center bg-white p-2 rounded-lg mb-2">
                                    {booking.qr_code_url ? (
                                        <img 
                                            src={booking.qr_code_url} 
                                            alt="QR Code" 
                                            className="w-20 h-20 object-contain"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-slate-800 flex items-center justify-center rounded">
                                            <span className="text-[8px] text-slate-500 uppercase tracking-tighter">QR Pending</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-center text-[10px] mt-2 font-mono text-slate-500 uppercase tracking-[0.1em]">
                                    {`${booking.id?.split('-')[0] || 'VOID'}-${pnr}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>

        {canTrack && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
               className="bg-emerald-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-emerald-500/20"
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-lg">Track Live Route</h4>
                        <p className="text-emerald-100 text-sm">Follow your flight on the interactive interactive radar.</p>
                    </div>
                </div>
                <Link 
                    href={`/flights/status/${pnr}`} 
                    className="bg-white text-emerald-600 font-bold py-3 px-6 rounded-full whitespace-nowrap hover:bg-emerald-50 transition-colors shadow-sm w-full sm:w-auto text-center"
                >
                    Open Live Tracker
                </Link>
            </motion.div>
        )}
      </div>
    
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
          >
            <div className="flex items-center gap-4 text-rose-600 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Cancel Booking?</h3>
            </div>
            <p className="text-slate-600 mb-8">
              Are you sure you want to cancel this booking? This action cannot be undone, and cancellation fees may apply based on the airlines policy.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
              >
                Yes, Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
