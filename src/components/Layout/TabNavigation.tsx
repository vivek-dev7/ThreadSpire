
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookMarked, BarChart3, FileText } from 'lucide-react';

export function TabNavigation() {
  const location = useLocation();

  const tabs = [
    {
      name: 'Home',
      path: '/',
      icon: Home
    },
    {
      name: 'Drafts',
      path: '/drafts',
      icon: FileText
    },
    {
      name: 'Collections',
      path: '/collections',
      icon: BookMarked
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: BarChart3
    }
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.name}
                to={tab.path}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
