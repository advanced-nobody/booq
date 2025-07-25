import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/solid'; 

interface NavItem {
  path: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

export const BottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: (active) => <HomeIcon className={`w-6 h-6 ${active ? 'text-emerald-600' : 'text-slate-500'}`} />,
    },
    {
      path: '/discover',
      label: 'Discover',
      icon: (active) => <MagnifyingGlassIcon className={`w-6 h-6 ${active ? 'text-emerald-600' : 'text-slate-500'}`} />,
    },
    {
      path: '/friends',
      label: 'Friends',
      icon: (active) => <UserGroupIcon className={`w-6 h-6 ${active ? 'text-emerald-600' : 'text-slate-500'}`} />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-top-strong z-30">
      <div className="container mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center text-xs font-medium p-2 rounded-lg transition-colors duration-200 ease-in-out w-20
                ${isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100/50'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon(isActive)}
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <style>{`
        .shadow-top-strong {
          box-shadow: 0 -6px 12px -3px rgba(0, 0, 0, 0.07), 0 -4px 8px -2px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </nav>
  );
};