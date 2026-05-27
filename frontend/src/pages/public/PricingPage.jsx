import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiTruck, FiZap } from 'react-icons/fi';

// Per-shipment pricing tiers
const PRICING_TIERS = [
  {
    label: 'Normal',
    icon: <FiTruck size={22} />,
    ratePerKg: 35,
    ratePerKm: 25,
    color: 'border-gray-200',
    badge: null,
    badgeColor: '',
    description: 'Standard delivery — reliable and affordable',
    features: [
      '35 ETB per kilogram',
      '25 ETB per kilometer',
      'Minimum fare: 200 ETB',
      'Real-time tracking',
      'Email notifications',
      'Proof of delivery',
    ],
    cta: 'Ship Now',
    ctaStyle: 'btn-secondary',
    ctaLink: '/register',
  },
  {
    label: 'Urgent',
    icon: <FiZap size={22} />,
    ratePerKg: 40,
    ratePerKm: 25,
    color: 'border-primary-500',
    badge: 'Fastest',
    badgeColor: 'bg-primary-500',
    description: 'Priority delivery — when time matters most',
    features: [
      '40 ETB per kilogram',
      '25 ETB per kilometer',
      'Minimum fare: 200 ETB',
      'Real-time GPS tracking',
      'SMS & push notifications',
      'Priority driver assignment',
      'Proof of delivery',
    ],
    cta: 'Ship Urgent',
    ctaStyle: 'btn-primary',
    ctaLink: '/register',
  },
];

const PricingPage = () => (
  <div className="min-h-screen">
    {/* Hero */}
    <section className="bg-gradient-to-br from-dark-900 to-dark-800 text-white py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-300 text-lg mb-6">
            Pay only for what you ship — no subscriptions, no hidden fees
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-gray-300">
            <FiTruck size={14} />
            Pricing is per shipment · based on weight &amp; distance
          </div>
        </motion.div>
      </div>
    </section>

    {/* Pricing cards */}
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {PRICING_TIERS.map((tier, i) => (
            <motion.div
              key={tier.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card border-2 ${tier.color} relative ${tier.badge ? 'shadow-xl scale-105' : ''}`}
            >
              {tier.badge && (
                <span className={`absolute -top-3 left-1/2 -translate-x-1/2 ${tier.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                  {tier.badge}
                </span>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.badge ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                  {tier.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">{tier.label}</h3>
                  <p className="text-gray-500 text-xs">{tier.description}</p>
                </div>
              </div>

              {/* Rate highlight */}
              <div className={`rounded-xl p-4 mb-5 ${tier.badge ? 'bg-primary-50' : 'bg-gray-50'}`}>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-extrabold ${tier.badge ? 'text-primary-600' : 'text-gray-900'}`}>
                    {tier.ratePerKg}
                  </span>
                  <span className="text-gray-500 text-sm mb-1.5">ETB / kg</span>
                </div>
                <p className="text-xs text-gray-500">+ {tier.ratePerKm} ETB per km · min 200 ETB</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCheckCircle className="text-green-500 flex-shrink-0" size={15} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link to={tier.ctaLink} className={`${tier.ctaStyle} w-full text-center block`}>
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Example calculation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 card border border-gray-200"
        >
          <h3 className="font-semibold text-gray-900 mb-4 text-center">Example Calculation</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { label: 'Normal', kg: 20, km: 300, rate: 35, color: 'text-gray-700' },
              { label: 'Urgent', kg: 20, km: 300, rate: 40, color: 'text-primary-600' },
            ].map(({ label, kg, km, rate, color }) => {
              const weightCost = kg * rate;
              const distCost   = km * 25;
              const total      = Math.max(weightCost + distCost, 200);
              return (
                <div key={label} className="bg-gray-50 rounded-xl p-4">
                  <p className={`font-semibold mb-3 ${color}`}>{label} — {kg}kg, {km}km</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Weight ({kg} kg × {rate} ETB)</span>
                      <span>ETB {weightCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance ({km} km × 25 ETB)</span>
                      <span>ETB {distCost.toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between font-bold pt-2 border-t border-gray-200 ${color}`}>
                      <span>Total</span>
                      <span>ETB {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  </div>
);

export default PricingPage;
