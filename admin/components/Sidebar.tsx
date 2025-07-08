import { IconCreditCard, IconHome, IconReport, IconSettings, IconUsers } from '@tabler/icons-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const menu = [
  { label: 'Dashboard', icon: <IconHome size={20} />, path: '/dashboard' },
  { label: 'Merchants', icon: <IconUsers size={20} />, path: '/merchants' },
  { label: 'Transactions', icon: <IconCreditCard size={20} />, path: '/transactions' },
  { label: 'Reports', icon: <IconReport size={20} />, path: '/reports' },
  { label: 'Settings', icon: <IconSettings size={20} />, path: '/settings' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  return (
    <aside className="w-64 bg-white shadow h-screen flex flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-xl border-b">QuickKub Admin</div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menu.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-3 py-2 rounded hover:bg-blue-50 transition ${location.pathname.startsWith(item.path) ? 'bg-blue-100 font-semibold' : ''}`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
