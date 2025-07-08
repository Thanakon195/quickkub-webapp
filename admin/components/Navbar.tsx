import React from 'react';

const Navbar: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b flex items-center px-6 justify-between">
      <div className="font-semibold text-lg">Admin Dashboard</div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">admin@quickkub.com</span>
        <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
