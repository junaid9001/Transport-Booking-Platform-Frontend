"use client";
import { useState, useEffect } from 'react';
import { flightApi } from '@/lib/flightApi';
import { X, Check, Plane, MapPin, Building, Calendar, Clock, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FlightForm({ initialData = {}, onSubmit, onCancel, submitting }) {
  const [formData, setFormData] = useState({
    flight_number: initialData.flight_number || '',
    airline_id: initialData.airline_id || '',
    aircraft_type_id: initialData.aircraft_type_id || '',
    origin_airport_id: initialData.origin_airport_id || '',
    destination_airport_id: initialData.destination_airport_id || '',
    departure_time: initialData.departure_time ? new Date(initialData.departure_time).toISOString().slice(0, 16) : '',
    arrival_time: initialData.arrival_time ? new Date(initialData.arrival_time).toISOString().slice(0, 16) : '',
    days_of_week: initialData.days_of_week || [1, 2, 3, 4, 5, 6, 7],
    duration_minutes: initialData.duration_minutes || 0,
    is_active: initialData.is_active ?? true
  });

  const [airlines, setAirlines] = useState([]);
  const [airports, setAirports] = useState([]);
  const [aircraftTypes, setAircraftTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      const [airlineData, airportData, aircraftData] = await Promise.all([
        flightApi.getAirlines(),
        flightApi.searchAirports(''),
        flightApi.getAircraftTypes(),
      ]);
      setAirlines(airlineData);
      setAirports(airportData);
      setAircraftTypes(aircraftData);
    } catch (error) {
      console.error("Failed to load dropdowns:", error);
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.flight_number) e.flight_number = "Required";
    if (!formData.airline_id) e.airline_id = "Required";
    if (!formData.origin_airport_id) e.origin_airport_id = "Required";
    if (!formData.destination_airport_id) e.destination_airport_id = "Required";
    if (!formData.departure_time) e.departure_time = "Required";
    if (!formData.arrival_time) e.arrival_time = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Ensure times are in RFC3339 for backend
    const payload = {
      ...formData,
      departure_time: new Date(formData.departure_time).toISOString(),
      arrival_time: new Date(formData.arrival_time).toISOString(),
    };
    onSubmit(payload);
  };

  const toggleDay = (day) => {
    setFormData(prev => {
      const days = prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day];
      return { ...prev, days_of_week: days.sort() };
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-200"
    >
      <form onSubmit={handleSubmit} className="p-8 sm:p-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {initialData.id ? 'Edit Flight Template' : 'New Flight Template'}
            </h2>
            <p className="text-slate-400 font-medium mt-0.5">Configure scheduled flight route and technical specs.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Flight Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Flight Number</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                required
                type="text"
                value={formData.flight_number}
                onChange={(e) => setFormData({...formData, flight_number: e.target.value})}
                placeholder="e.g. AI-101"
                className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold text-slate-700"
              />
            </div>
          </div>

          {/* Airline */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Airline</label>
            <select
              required
              value={formData.airline_id}
              onChange={(e) => setFormData({...formData, airline_id: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold text-slate-700"
            >
              <option value="">Select Airline</option>
              {airlines.map(a => <option key={a.id} value={a.id}>{a.name} ({a.iata_code})</option>)}
            </select>
          </div>

          {/* Origin */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Origin Airport</label>
            <select
              required
              value={formData.origin_airport_id}
              onChange={(e) => setFormData({...formData, origin_airport_id: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold text-slate-700"
            >
              <option value="">Select Origin</option>
              {airports.map(a => <option key={a.id} value={a.id}>{a.city} - {a.iata_code}</option>)}
            </select>
          </div>

          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Destination Airport</label>
            <select
              required
              value={formData.destination_airport_id}
              onChange={(e) => setFormData({...formData, destination_airport_id: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold text-slate-700"
            >
              <option value="">Select Destination</option>
              {airports.map(a => <option key={a.id} value={a.id}>{a.city} - {a.iata_code}</option>)}
            </select>
          </div>

          {/* Times */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Departure Time</label>
            <input
              required
              type="datetime-local"
              value={formData.departure_time}
              onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold text-slate-700"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Arrival Time</label>
            <input
              required
              type="datetime-local"
              value={formData.arrival_time}
              onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold text-slate-700"
            />
          </div>

          {/* Aircraft Type */}
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Aircraft Type</label>
            <select
              required
              value={formData.aircraft_type_id}
              onChange={(e) => setFormData({...formData, aircraft_type_id: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold text-slate-700"
            >
              <option value="">Select Aircraft Type</option>
              {aircraftTypes.map(a => <option key={a.id} value={a.id}>{a.manufacturer} {a.model}</option>)}
            </select>
          </div>

          {/* Days of week */}
          <div className="col-span-2 space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Operating Days</label>
            <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {[1,2,3,4,5,6,7].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
                    formData.days_of_week.includes(day)
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-300'
                  }`}
                >
                  {['MON','TUE','WED','THU','FRI','SAT','SUN'][day-1]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-[2] py-4 px-6 rounded-2xl font-bold bg-slate-900 text-white hover:bg-black transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Check size={20} />}
            {submitting ? 'Creating...' : (initialData.id ? 'Update Flight' : 'Create Flight')}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
