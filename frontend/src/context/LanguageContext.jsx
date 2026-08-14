import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Nav & Sidebar
    home: 'Home',
    services: 'Services',
    pricing: 'Pricing',
    track: 'Track',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    register: 'Get Started',
    getStarted: 'Get Started',
    logout: 'Logout',
    dashboard: 'Dashboard',
    myShipments: 'My Shipments',
    createShipment: 'Create Shipment',
    createNewShipment: 'Create New Shipment',
    trackShipment: 'Track Shipment',
    notifications: 'Notifications',
    profile: 'Profile',
    myDeliveries: 'My Deliveries',
    navigation: 'Navigation',
    manageDrivers: 'Manage Drivers',
    manageVehicles: 'Manage Vehicles',
    assignments: 'Assignments',
    paymentApproval: 'Payment Approval',
    trackingCenter: 'Tracking Center',
    reports: 'Reports',
    userManagement: 'User Management',
    analytics: 'Analytics',
    settings: 'Settings',

    // Form & Locations
    pickupLocation: 'Pickup Location',
    deliveryLocation: 'Delivery Location',
    city: 'City',
    selectCity: 'Select city',
    address: 'Address',
    contactName: 'Contact Name',
    contactPhone: 'Contact Phone',
    kebele: 'Kebele',
    homeNumber: 'Home Number',
    mapLocationLink: 'Map Location Link',
    cargoInfo: 'Cargo Information',
    cargoDescription: 'Description',
    cargoCategory: 'Category',
    cargoWeight: 'Weight (kg)',
    cargoQuantity: 'Quantity',
    priority: 'Priority',
    specialInstructions: 'Special Instructions',
    reviewSubmit: 'Review & Submit',

    // Priorities
    normal: 'Normal',
    urgent: 'Urgent',

    // Actions & Buttons
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    submitPay: 'Submit & Pay',
    submitting: 'Submitting...',
    cancel: 'Cancel',
    save: 'Save',
    saveChanges: 'Save Changes',
    search: 'Search...',
    all: 'All',
    filter: 'Filter',
    downloadInvoice: 'Download Invoice (PDF)',
    payNow: 'Pay Now',
    rateDelivery: 'Rate Delivery',
    confirmDelivery: 'Confirm Delivery',

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

    // Auth
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Your Account',
    email: 'Email Address',
    password: 'Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone Number',
    role: 'Account Type',
    customer: 'Customer',
    driver: 'Driver',
    fleet_manager: 'Fleet Manager',
    admin: 'System Admin',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signIn: 'Sign In',
    signUp: 'Sign Up',

    // Dashboard & Sections
    totalShipments: 'Total Shipments',
    activeDeliveries: 'Active Deliveries',
    revenue: 'Total Revenue',
    pendingPayments: 'Pending Payments',
    recentShipments: 'Recent Shipments',
    quickActions: 'Quick Actions',
    assignedDriver: 'Assigned Driver',
    cargoDetails: 'Cargo Details',
    priceBreakdown: 'Price Breakdown',
    estimatedDistance: 'Estimated Distance',
    baseFare: 'Base Fare',
    total: 'Total',
  },
  am: {
    // Nav & Sidebar
    home: 'መነሻ',
    services: 'አገልግሎቶች',
    pricing: 'ዋጋ',
    track: 'ተከታተል',
    about: 'ስለ እኛ',
    contact: 'እውቂያ',
    login: 'ግባ',
    register: 'ጀምር',
    getStarted: 'ጀምር',
    logout: 'ውጣ',
    dashboard: 'ዳሽቦርድ',
    myShipments: 'የእኔ ጭነቶች',
    createShipment: 'አዲስ ጭነት ፍጠር',
    createNewShipment: 'አዲስ ጭነት መፍጠሪያ',
    trackShipment: 'ጭነት ተከታተል',
    notifications: 'ማሳወቂያዎች',
    profile: 'መገለጫ',
    myDeliveries: 'የእኔ የርክክብ ሥራዎች',
    navigation: 'ካርታ እና አቅጣጫ',
    manageDrivers: 'አሽከርካሪዎችን አስተዳድር',
    manageVehicles: 'ተሽከርካሪዎችን አስተዳድር',
    assignments: 'የጭነት ምደባዎች',
    paymentApproval: 'የክፍያ ማረጋገጫ',
    trackingCenter: 'የተሽከርካሪዎች መከታተያ',
    reports: 'ሪፖርቶች',
    userManagement: 'የተጠቃሚዎች አስተዳደር',
    analytics: 'ትንታኔ',
    settings: 'ማስተካከያዎች',

    // Form & Locations
    pickupLocation: 'የመጫኛ ቦታ',
    deliveryLocation: 'የማስረከቢያ ቦታ',
    city: 'ከተማ',
    selectCity: 'ከተማ ይምረጡ',
    address: 'አድራሻ',
    contactName: 'የተቀባይ/ላኪ ስም',
    contactPhone: 'የስልክ ቁጥር',
    kebele: 'ቀበሌ',
    homeNumber: 'የቤት ቁጥር',
    mapLocationLink: 'የካርታ ሊንክ',
    cargoInfo: 'የጭነቱ መረጃ',
    cargoDescription: 'መግለጫ',
    cargoCategory: 'ምድብ',
    cargoWeight: 'ክብደት (ኪ.ግ)',
    cargoQuantity: 'ብዛት',
    priority: 'ቅድሚያ',
    specialInstructions: 'ልዩ መመሪያዎች',
    reviewSubmit: 'ከልስ እና አቅርብ',

    // Priorities
    normal: 'መደበኛ',
    urgent: 'አስቸኳይ',

    // Actions & Buttons
    next: 'ቀጣይ',
    previous: 'ቀደመው',
    submit: 'ላክ',
    submitPay: 'ክፈል እና አቅርብ',
    submitting: 'በማስገባት ላይ...',
    cancel: 'ሰርዝ',
    save: 'አስቀምጥ',
    saveChanges: 'ለወጦችን አስቀምጥ',
    search: 'ፈልግ...',
    all: 'ሁሉንም',
    filter: 'አጣራ',
    downloadInvoice: 'ኢንቮይስ አውርድ (PDF)',
    payNow: 'አሁን ክፈል',
    rateDelivery: 'ርክክቡን ገምግም',
    confirmDelivery: 'ርክክቡን አረጋግጥ',

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

    // Auth
    welcomeBack: 'እንኳን ደህና መጡ',
    createAccount: 'አዲስ መለያ ይፍጠሩ',
    email: 'ኢሜይል አድራሻ',
    password: 'የይለፍ ቃል',
    firstName: 'ስም',
    lastName: 'የአባት ስም',
    phone: 'ስልክ ቁጥር',
    role: 'የመለያ ዓይነት',
    customer: 'ደንበኛ',
    driver: 'አሽከርካሪ',
    fleet_manager: 'የካርጎ አስተዳዳሪ',
    admin: 'ሲስተም አድሚን',
    alreadyHaveAccount: 'መለያ አለዎት?',
    dontHaveAccount: 'መለያ የሎትም?',
    signIn: 'ግባ',
    signUp: 'ተመዝገብ',

    // Dashboard & Sections
    totalShipments: 'ጠቅላላ ጭነቶች',
    activeDeliveries: 'በሂደት ላይ ያሉ',
    revenue: 'ጠቅላላ ገቢ',
    pendingPayments: 'ያልተከፈሉ ክፍያዎች',
    recentShipments: 'የቅርብ ጊዜ ጭነቶች',
    quickActions: 'ፈጣን እርምጃዎች',
    assignedDriver: 'የተመደበ አሽከርካሪ',
    cargoDetails: 'የጭነት ዝርዝር',
    priceBreakdown: 'የዋጋ ዝርዝር',
    estimatedDistance: 'የተገመተ ርቀት',
    baseFare: 'መነሻ ዋጋ',
    total: 'ጠቅላላ',
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

  const t = (key, fallback) => {
    return translations[lang]?.[key] || translations['en']?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
