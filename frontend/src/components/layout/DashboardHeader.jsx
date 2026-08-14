import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiBell, FiSun, FiMoon, FiSearch, FiMenu, FiGlobe } from 'react-icons/fi';
import { toggleDarkMode, toggleSidebar } from '../../redux/slices/uiSlice';
import { fetchNotifications, markAllAsRead } from '../../redux/slices/notificationSlice';
import { useLanguage } from '../../context/LanguageContext';
import { timeAgo } from '../../utils/helpers';

const DashboardHeader = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.ui);
  const { unreadCount, items } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);
  const { lang, toggleLanguage, t } = useLanguage();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleNotifOpen = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) dispatch(fetchNotifications());
  };

  return (
    <header className="h-16 bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-dark-700 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500 md:hidden"
        >
          <FiMenu size={20} />
        </button>
        <div className="relative hidden md:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={t('search', 'Search...')}
            className="pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-dark-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
          title="Change Language"
        >
          <FiGlobe className="text-primary-500" size={14} />
          <span>{lang === 'en' ? '🇪🇹 አማርኛ' : '🇺🇸 EN'}</span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500 dark:text-gray-400"
        >
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleNotifOpen}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500 dark:text-gray-400 relative"
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-gray-100 dark:border-dark-700 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-700">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllAsRead())}
                    className="text-xs text-primary-500 hover:text-primary-600"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-6">No notifications</p>
                ) : (
                  items.map((n) => (
                    <div
                      key={n._id}
                      className={`px-4 py-3 border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 ${!n.isRead ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <span className="text-primary-600 font-semibold text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:block">
            {user?.firstName}
          </span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
