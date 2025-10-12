import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div 
      className="flex flex-col h-screen bg-gray-50"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Navbar Only - Further reduced height */}
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between h-6 px-6 w-full">
          <h1 
            className="text-lg font-bold text-gray-800"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Techaven Admin
          </h1>
          <span 
            className="text-xs text-gray-700"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Welcome, {user?.name || 'Admin'}
          </span>
        </div>
      </header>

      {/* Page content */}
      <main 
        className="flex-1 overflow-auto"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;