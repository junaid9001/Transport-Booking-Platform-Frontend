"use client";
import { useState, useEffect } from 'react';
import { flightApi } from '@/lib/flightApi';
import { Plane, Search, Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function FlightTemplateList() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => { loadFlights(); }, []);

  const loadFlights = async () => {
    try {
      setLoading(true);
      const data = await flightApi.admin.getAllFlightTemplates();
      setFlights(data);
    } catch (error) {
      console.error("Failed to load flight templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (flight) => {
    try {
      setActionLoading(flight.id);
      await flightApi.admin.updateFlight(flight.id, { is_active: !flight.is_active });
      loadFlights();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to update flight");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (flightId) => {
    if (!confirm("This will soft-delete the flight template. It will stop generating new instances. Continue?")) return;
    try {
      setActionLoading(flightId);
      await flightApi.admin.deleteFlight(flightId);
      loadFlights();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete flight");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredFlights = flights.filter(f =>
    (f.flight_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.airline?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.origin_airport?.city || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.destination_airport?.city || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFlights.length / itemsPerPage);
  const paginatedFlights = filteredFlights.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by flight number, airline, city..."
            className="w-full pl-12 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-bold text-sm"
          />
        </div>
        <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Templates</span>
          <p className="text-xl font-black text-slate-900 leading-none">{filteredFlights.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold animate-pulse">Loading templates...</p>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-slate-400">
            <div className="p-6 bg-slate-50 rounded-full mb-4 border border-slate-100">
              <Plane size={40} className="text-slate-200" />
            </div>
            <h3 className="text-lg font-black text-slate-600 uppercase tracking-tight">No Templates Found</h3>
            <p className="text-sm font-medium mt-1">Create a flight template to get started.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Flight</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Days</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedFlights.map((flight) => (
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={flight.id}
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                            <Plane size={18} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900 tracking-tight">{flight.flight_number}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{flight.airline?.name || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                          <span>{flight.origin_airport?.iata_code || '???'}</span>
                          <MapPin size={12} className="text-slate-300" />
                          <span>{flight.destination_airport?.iata_code || '???'}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {flight.origin_airport?.city} → {flight.destination_airport?.city}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Clock size={14} className="text-slate-400" />
                          {flight.departure_time ? new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          <span className="text-slate-300 mx-1">→</span>
                          {flight.arrival_time ? new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{flight.duration_minutes || 0} min</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-1 flex-wrap max-w-[160px]">
                          {DAYS.map((day, i) => {
                            const isActive = (flight.days_of_week || []).includes(i + 1);
                            return (
                              <span
                                key={day}
                                className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-slate-100 text-slate-300'
                                }`}
                              >
                                {day}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          flight.is_active
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-rose-100 text-rose-700 border-rose-200'
                        }`}>
                          {flight.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleActive(flight)}
                            disabled={actionLoading === flight.id}
                            className={`p-2 rounded-xl transition-all border border-transparent ${
                              flight.is_active
                                ? 'hover:bg-amber-50 text-amber-500 hover:border-amber-100'
                                : 'hover:bg-emerald-50 text-emerald-500 hover:border-emerald-100'
                            }`}
                            title={flight.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {flight.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          </button>
                          <button
                            onClick={() => handleDelete(flight.id)}
                            disabled={actionLoading === flight.id}
                            className="p-2 hover:bg-red-50 rounded-xl text-slate-300 hover:text-red-500 transition-colors border border-transparent"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between sticky bottom-0 z-10 backdrop-blur-md">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, filteredFlights.length)}</span> of {filteredFlights.length}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-50 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  Page {currentPage} of {totalPages || 1}
                </div>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-white disabled:opacity-50 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
