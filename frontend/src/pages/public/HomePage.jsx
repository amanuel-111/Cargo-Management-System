import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiTruck, FiMapPin, FiShield, FiClock, FiStar, FiArrowRight,
  FiPackage, FiBarChart2, FiSmartphone, FiCheckCircle,
} from 'react-icons/fi';

const features = [
  { icon: FiMapPin, title: 'Real-Time Tracking', desc: 'Track your shipments live on the map with GPS precision.' },
  { icon: FiShield, title: 'Secure & Insured', desc: 'All cargo is handled with care and insurance options available.' },
  { icon: FiClock, title: 'On-Time Delivery', desc: '99.2% on-time delivery rate across all Ethiopian regions.' },
  { icon: FiBarChart2, title: 'Smart Analytics', desc: 'Detailed reports and insights for your logistics operations.' },
  { icon: FiSmartphone, title: 'Mobile Ready', desc: 'Manage everything from your phone, anywhere, anytime.' },
  { icon: FiPackage, title: 'All Cargo Types', desc: 'From fragile goods to heavy machinery, we handle it all.' },
];

const stats = [
  { value: '50,000+', label: 'Deliveries Completed' },
  { value: '1,200+', label: 'Active Drivers' },
  { value: '500+', label: 'Fleet Vehicles' },
  { value: '99.2%', label: 'On-Time Rate' },
];

const testimonials = [
  { name: 'Abebe Girma', role: 'Business Owner, Addis Ababa', text: 'Smart Transport transformed our supply chain. Real-time tracking gives us peace of mind.', rating: 5 },
  { name: 'Tigist Haile', role: 'Import/Export Manager', text: 'The fleet management dashboard is incredible. We reduced costs by 30% in the first month.', rating: 5 },
  { name: 'Dawit Bekele', role: 'E-commerce Entrepreneur', text: 'Fast, reliable, and professional. Our customers love the tracking feature.', rating: 5 },
];

const HomePage = () => {
  const [trackingNum, setTrackingNum] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingNum.trim()) navigate(`/track/${trackingNum.trim()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-600 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 bg-primary-500/20 text-primary-400 text-sm font-medium px-3 py-1 rounded-full mb-6">
                <FiTruck size={14} /> Ethiopia's #1 Transport Platform
              </span>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Smart Cargo &<br />
                <span className="text-primary-400">Transport</span><br />
                Management
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Connect with verified drivers, track shipments in real-time, and manage your entire logistics operation from one powerful platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary text-center text-base py-3 px-8">
                  Get Started Free
                </Link>
                <Link to="/services" className="btn-secondary text-center text-base py-3 px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Learn More
                </Link>
              </div>
            </motion.div>

            {/* Tracking Widget */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h3 className="text-xl font-semibold mb-2">Track Your Shipment</h3>
                <p className="text-gray-400 text-sm mb-6">Enter your tracking number to get real-time updates</p>
                <form onSubmit={handleTrack} className="space-y-4">
                  <input
                    type="text"
                    value={trackingNum}
                    onChange={(e) => setTrackingNum(e.target.value)}
                    placeholder="e.g. STC-ABC123-XY"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button type="submit" className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                    <FiMapPin size={16} /> Track Shipment
                  </button>
                </form>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[['Active Shipments', '2,847'], ['Drivers Online', '342']].map(([label, val]) => (
                    <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-primary-400">{val}</p>
                      <p className="text-xs text-gray-400 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-primary-100 text-sm mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">A complete logistics platform built for Ethiopian businesses, with features that scale with your needs.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  <Icon className="text-primary-500" size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500">Simple steps to get your cargo moving</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Create Request', desc: 'Submit your cargo details and pickup/delivery locations.' },
              { step: '02', title: 'Get Assigned', desc: 'A verified driver and vehicle are assigned to your shipment.' },
              { step: '03', title: 'Track Live', desc: 'Monitor your shipment in real-time on the map.' },
              { step: '04', title: 'Delivered', desc: 'Receive confirmation with proof of delivery.' },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-primary-500 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, j) => (
                    <FiStar key={j} className="text-yellow-400 fill-yellow-400" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4">"{text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-gray-500 text-xs">{role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Logistics?</h2>
          <p className="text-primary-100 mb-8">Join thousands of Ethiopian businesses already using Smart Transport.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2">
              Start Free Today <FiArrowRight />
            </Link>
            <Link to="/contact" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
