import React from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiPackage, FiMap, FiBarChart2, FiShield, FiClock } from 'react-icons/fi';

const services = [
  { icon: FiTruck, title: 'Cargo Transport', desc: 'Full-truck and partial-load transport across all Ethiopian regions with real-time tracking.' },
  { icon: FiPackage, title: 'Express Delivery', desc: 'Same-day and next-day delivery for urgent shipments within major cities.' },
  { icon: FiMap, title: 'Fleet Management', desc: 'Complete fleet management solution for transport companies with analytics and reporting.' },
  { icon: FiBarChart2, title: 'Logistics Analytics', desc: 'Data-driven insights to optimize your supply chain and reduce costs.' },
  { icon: FiShield, title: 'Cargo Insurance', desc: 'Comprehensive insurance options to protect your valuable shipments.' },
  { icon: FiClock, title: 'Scheduled Transport', desc: 'Plan and schedule regular transport routes for consistent supply chain operations.' },
];

const ServicesPage = () => (
  <div className="min-h-screen">
    <section className="bg-gradient-to-br from-dark-900 to-dark-800 text-white py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Our Services</h1>
        <p className="text-gray-300 text-lg">Comprehensive logistics solutions for every business need</p>
      </div>
    </section>
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                <Icon className="text-primary-500" size={22} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default ServicesPage;
