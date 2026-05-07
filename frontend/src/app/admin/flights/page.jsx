"use client";

import { useState, useEffect } from 'react';
import { Plane, MapPin, Building, Calendar, Plus, Search, Ticket, Users, DollarSign, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { flightApi } from '@/lib/flightApi';
import FlightBookingList from './components/FlightBookingList';
import FlightForm from './components/FlightForm';
import FlightTemplateList from './components/FlightTemplateList';
import GenericFlightList from './components/GenericFlightList';

export default function FlightManagement() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const tabs = [
    { id: 'bookings', name: 'Bookings', icon: Ticket },
    { id: 'flights', name: 'Flight Templates', icon: Plane },
    { id: 'airports', name: 'Airports', icon: MapPin },
    { id: 'airlines', name: 'Airlines', icon: Building },
  ];

  const handleCreateFlight = async (flightData) => {
    try {
      setSubmitting(true);
      await flightApi.admin.createFlight(flightData);
      setShowForm(false);
      alert("Flight template created successfully!");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to create flight template");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Flight Operations</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Monitor bookings and manage global flight schedules.</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'flights' && (
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-black py-3 px-6 rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-95"
            >
              <Plus size={20} />
              <span>Create Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-200/50 p-1.5 rounded-[22px] w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2.5 py-3 px-8 text-xs font-black uppercase tracking-widest rounded-2xl transition-all z-10 ${
                isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="flightAdminTab"
                  className="absolute inset-0 bg-white rounded-[18px] shadow-sm border border-slate-200"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={18} strokeWidth={2.5} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {activeTab === 'bookings' && <FlightBookingList />}
        {(activeTab === 'airports' || activeTab === 'airlines') && <GenericFlightList type={activeTab} />}
        
        {activeTab === 'flights' && <FlightTemplateList />}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <FlightForm 
              onSubmit={handleCreateFlight} 
              onCancel={() => setShowForm(false)}
              submitting={submitting}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
