import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

const plans = [
  {
    name: 'Starter', price: 'Free', period: '', color: 'border-gray-200',
    features: ['Up to 10 shipments/month', 'Basic tracking', 'Email notifications', 'Customer support'],
    cta: 'Get Started', ctaStyle: 'btn-secondary',
  },
  {
    name: 'Business', price: 'ETB 2,500', period: '/month', color: 'border-primary-500', popular: true,
    features: ['Unlimited shipments', 'Real-time GPS tracking', 'SMS & push notifications', 'Analytics dashboard', 'Priority support', 'API access'],
    cta: 'Start Free Trial', ctaStyle: 'btn-primary',
  },
  {
    name: 'Enterprise', price: 'Custom', period: '', color: 'border-gray-200',
    features: ['Everything in Business', 'Dedicated fleet manager', 'Custom integrations', 'SLA guarantee', '24/7 support', 'White-label option'],
    cta: 'Contact Sales', ctaStyle: 'btn-secondary',
  },
];

const PricingPage = () => (
  <div className="min-h-screen">
    <section className="bg-gradient-to-br from-dark-900 to-dark-800 text-white py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-300 text-lg">Choose the plan that fits your business needs</p>
      </div>
    </section>
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(({ name, price, period, color, popular, features, cta, ctaStyle }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card border-2 ${color} relative ${popular ? 'shadow-lg scale-105' : ''}`}
            >
              {popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="font-bold text-gray-900 text-lg mb-2">{name}</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">{price}</span>
                <span className="text-gray-500 text-sm">{period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <FiCheckCircle className="text-green-500 flex-shrink-0" size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`${ctaStyle} w-full text-center block`}>{cta}</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default PricingPage;
