'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function TrackingMap({ liveData }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !liveData?.latitude || !liveData?.longitude) return;

    const position = [liveData.latitude, liveData.longitude];

    // Create map only once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: position,
        zoom: 5,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    const planeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a78bfa" width="40" height="40"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`;
    const planeIcon = L.divIcon({
      html: `<div style="transform:rotate(${liveData.heading || 0}deg);width:40px;height:40px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6))">${decodeURIComponent(planeSvg.replace(/%23/g, '#').replace(/<svg/, '<svg style="width:40px;height:40px"'))}</div>`,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else {
      markerRef.current = L.marker(position, { icon: planeIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<div style="font-family:monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.1em">
            <strong>FLIGHT STATUS: LIVE</strong><br/>
            ALT: ${Math.floor(liveData.altitude).toLocaleString()} FT<br/>
            SPD: ${Math.floor(liveData.speed_mph)} MPH
          </div>`
        );
    }

    mapInstanceRef.current.setView(position, 5);

    return () => {};
  }, [liveData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  if (!liveData?.latitude || !liveData?.longitude) {
    return (
      <div className="w-full h-[500px] bg-surface-container-high animate-pulse flex items-center justify-center">
        <p className="text-outline font-label uppercase text-xs tracking-widest">Searching Satellite Link...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] relative editorial-shadow border border-outline-variant/10">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
