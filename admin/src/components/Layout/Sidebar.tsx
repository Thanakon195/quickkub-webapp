import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Merchants', href: '/admin/merchants', icon: BuildingStorefrontIcon },
  { name: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
  { name: 'Transactions', href: '/admin/transactions', icon: CurrencyDollarIcon },
  { name: 'Wallets', href: '/admin/wallets', icon: BanknotesIcon },
  { name: 'Invoices', href: '/admin/invoices', icon: DocumentTextIcon },
  { name: 'Settlements', href: '/admin/settlements', icon: ChartBarIcon },
  { name: 'Reports', href: '/admin/reports', icon: ChartPieIcon },
  { name: 'Fraud Detection', href: '/admin/fraud', icon: ShieldCheckIcon },
  { name: 'Webhooks', href: '/admin/webhooks', icon: BellIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Q</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">QuickKub</span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <UserGroupIcon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">admin@quickkub.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;