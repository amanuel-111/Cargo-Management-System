import React from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaLinkedin, FaTelegram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                <FiTruck className="text-white text-lg" />
              </div>
              <span className="font-bold text-white text-lg">
                Smart<span className="text-primary-400">Transport</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Ethiopia's leading smart transport and cargo management platform. Connecting businesses with reliable logistics solutions.
            </p>
            <div className="flex gap-3">
              {[FaFacebook, FaTwitter, FaLinkedin, FaTelegram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-dark-700 rounded-lg flex items-center justify-center hover:bg-primary-500 transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['Home', '/'], ['Services', '/services'], ['Pricing', '/pricing'], ['Track Shipment', '/track'], ['About Us', '/about']].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Cargo Transport', 'Express Delivery', 'Fleet Management', 'Real-time Tracking', 'Logistics Consulting'].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <FiMapPin className="text-primary-400 flex-shrink-0" />
                <span>Bole Road, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="text-primary-400 flex-shrink-0" />
                <span>+251 911 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="text-primary-400 flex-shrink-0" />
                <span>info@smarttransport.et</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Smart Transport. All rights reserved.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <a href="#" className="hover:text-primary-400">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
