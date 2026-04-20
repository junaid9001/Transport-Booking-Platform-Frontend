'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { flightApi } from '@/lib/flightApi';

const TrackingMap = dynamic(
  () => import('@/components/flights/TrackingMap'),
  { ssr: false, loading: () => (
    <div className="w-full h-[500px] bg-surface-container-high animate-pulse flex items-center justify-center">
      <p className="text-outline font-label uppercase text-xs tracking-widest">Initializing Radar Module...</p>
    </div>
  )}
);

export default function FlightTrackingPage() {
  const { pnr } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pnr) return;

    const fetchStatus = async () => {
      try {
        const res = await flightApi.getFlightStatus(pnr);
        setData(res);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to locate flight.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll every 30 seconds for live radar updates
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [pnr]);

  if (loading) {
    return (
      <main className="pt-32 px-6 max-w-[1440px] mx-auto min-h-screen text-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-8"></div>
        <p className="font-label uppercase tracking-widest text-xs text-outline font-black">Establishing Satellite Link...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="pt-32 px-6 max-w-[1440px] mx-auto min-h-screen text-center flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-error mb-6">satellite_alt</span>
        <h1 className="text-4xl font-headline text-error mb-4">Radar Offline</h1>
        <p className="text-on-surface-variant font-light mb-10 max-w-md">{error}</p>
        <button onClick={() => router.push('/flights')} className="bg-primary text-white px-8 py-3 font-label text-xs uppercase tracking-widest hover:bg-secondary hover:text-primary transition-colors">
          Return Home
        </button>
      </main>
    );
  }

  return (
    <main className="pt-24 md:pt-40 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row items-end justify-between border-b border-outline-variant/10 pb-6 mb-10">
        <div>
          <span className="font-label text-[9px] uppercase tracking-[0.4em] text-outline font-black block mb-2">Live Flight Radar</span>
          <h1 className="text-4xl md:text-5xl font-headline text-primary tracking-wide">
            Flight {data.flight_number}
          </h1>
        </div>
        <div className="mt-6 md:mt-0 text-right">
          <div className="bg-secondary/10 px-4 py-2 inline-block">
            <span className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary font-black">{data.status}</span>
          </div>
          <p className="font-headline text-xl text-primary mt-2">{data.origin} • {data.destination}</p>
        </div>
      </div>

      {data.live && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-surface-container-low p-6 border border-outline-variant/5">
            <span className="font-label text-[9px] uppercase tracking-[0.3em] text-outline block mb-1">Altitude</span>
            <span className="font-headline text-2xl text-primary tabular-nums tracking-widest">{Math.floor(data.live.altitude).toLocaleString()} FT</span>
          </div>
          <div className="bg-surface-container-low p-6 border border-outline-variant/5">
            <span className="font-label text-[9px] uppercase tracking-[0.3em] text-outline block mb-1">Speed</span>
            <span className="font-headline text-2xl text-primary tabular-nums tracking-widest">{Math.floor(data.live.speed_mph)} MPH</span>
          </div>
          <div className="bg-surface-container-low p-6 border border-outline-variant/5">
            <span className="font-label text-[9px] uppercase tracking-[0.3em] text-outline block mb-1">Heading</span>
            <span className="font-headline text-2xl text-primary tabular-nums tracking-widest">{Math.floor(data.live.heading)}°</span>
          </div>
          <div className="bg-surface-container-low p-6 border border-outline-variant/5">
            <span className="font-label text-[9px] uppercase tracking-[0.3em] text-outline block mb-1">Coordinates</span>
            <span className="font-label text-xs uppercase tracking-widest text-primary font-black mt-2 inline-block tabular-nums">
              {data.live.latitude.toFixed(2)}, {data.live.longitude.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <TrackingMap liveData={data.live} />
      
    </main>
  );
}
