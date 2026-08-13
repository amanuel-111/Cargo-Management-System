import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Nav
    home: 'Home',
    services: 'Services',
    pricing: 'Pricing',
    track: 'Track',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    register: 'Get Started',
    logout: 'Logout',
    dashboard: 'Dashboard',
    // Actions
    trackShipment: 'Track Shipment',
    createShipment: 'Create Shipment',
    downloadInvoice: 'Download Invoice (PDF)',
    search: 'Search...',
    all: 'All',
    submit: 'Submit',
    cancel: 'Cancel',
    // Statuses
    pending: 'Pending Review',
    confirmed: 'Confirmed',
    assigned: 'Assigned',
    picked_up: 'Picked Up',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    failed: 'Delivery Failed',
    cancelled: 'Cancelled',
    // Titles
    myShipments: 'My Shipments',
    assignedDeliveries: 'Assigned Deliveries',
    fleetManagement: 'Fleet Management',
    paymentApproval: 'Payment Approval',
  },
  am: {
    // Nav
    home: 'መነሻ',
    services: 'አገልግሎቶች',
    pricing: 'ዋጋ',
    track: 'ተከታተል',
    about: 'ስለ እኛ',
    contact: 'እውቂያ',
    login: 'ግባ',
    register: 'ተመዝገብ',
    logout: 'ውጣ',
    dashboard: 'ዳሽቦርድ',
    // Actions
    trackShipment: 'ጭነት ተከታተል',
    createShipment: 'አዲስ ጭነት ፍጠር',
    downloadInvoice: 'ኢንቮይስ አውርድ (PDF)',
    search: 'ፈልግ...',
    all: 'ሁሉንም',
    submit: 'ላክ',
    cancel: 'ሰርዝ',
    // Statuses
    pending: 'በመጠባበቅ ላይ',
    confirmed: 'ተረጋገጠ',
    assigned: 'ተመደበ',
    picked_up: 'ተረከበ',
    in_transit: 'በመንገድ ላይ',
    out_for_delivery: 'ለማስረከብ በመንገድ ላይ',
    delivered: 'ተረከበ',
    failed: 'አልተሳካም',
    cancelled: 'ተሰረዘ',
    // Titles
    myShipments: 'የእኔ ጭነቶች',
    assignedDeliveries: 'የተመደቡ ጭነቶች',
    fleetManagement: 'የተሽከርካሪዎች አስተዳደር',
    paymentApproval: 'የክፍያ ማረጋገጫ',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'am' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
