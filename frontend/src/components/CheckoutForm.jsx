'use client';

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

export default function CheckoutForm({ bookingId, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe usually expects a return_url for redirect-based payments (like 3D Secure)
        // For our real-time WS flow, we primarily care about the paymentIntent object or the webhook
        return_url: `${window.location.origin}/flights/confirmation?booking_id=${bookingId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // paymentIntent.succeeded handled client-side
      // We still wait for backend WS confirmation in the parent component for final state
      onPaymentSuccess(paymentIntent);
    } else {
        // If it requires redirect, the browser will navigate to return_url
        setMessage("Processing payment...");
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-surface-container-high/20 p-6 rounded-xl border border-outline-variant/10">
        <PaymentElement 
            id="payment-element" 
            options={{
                layout: 'tabs',
            }}
        />
      </div>
      
      {message && (
        <div id="payment-message" className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-[10px] font-bold uppercase tracking-widest text-center">
            {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="w-full bg-primary text-white py-6 font-label text-xs font-black uppercase tracking-[0.4em] hover:bg-secondary hover:text-primary transition-all disabled:opacity-30 relative overflow-hidden shadow-2xl"
      >
        <span id="button-text">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Securing Transaction...</span>
            </div>
          ) : (
            "Authorize Payment"
          )}
        </span>
      </button>

      <div className="flex items-center justify-center gap-2 opacity-40">
        <span className="material-symbols-outlined text-sm">lock</span>
        <p className="text-[9px] uppercase tracking-widest font-black">PCI-DSS Compliant Encryption</p>
      </div>
    </form>
  );
}
