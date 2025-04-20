// components/admin/AdminLayout.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/admin/dashboard" 
                className="block p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/orders" 
                className="block p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded"
              >
                Orders
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/products" 
                className="block p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded"
              >
                Products
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;