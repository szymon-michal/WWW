import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Stethoscope, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <Stethoscope className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">DentalCare</span>
            </div>

            <nav className="mt-5 flex-grow flex flex-col px-2 space-y-1">
              <div className="text-xs font-semibold text-gray-500 px-2 py-2 uppercase tracking-wider">
                Admin
              </div>
              <a
                href="#"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-100 text-blue-900"
              >
                <Settings className="mr-3 h-5 w-5 text-blue-500" />
                Dashboard
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1" />

            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3 hidden md:block">
                    <div className="text-base font-medium text-gray-800">
                      {user?.firstName || user?.email}
                      {user?.lastName ? ` ${user.lastName}` : ''}
                    </div>
                    <div className="text-sm font-medium text-gray-500">Admin</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
