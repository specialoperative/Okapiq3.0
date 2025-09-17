'use client';

import { 
  Bars3Icon, 
  BellIcon, 
  UserCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ setSidebarOpen }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center">
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-4 w-4" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-semibold text-gray-900">Okapiq</h1>
            <p className="text-sm text-gray-500">Market Intelligence Dashboard</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-4 w-4" />
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
            <span className="sr-only">Settings</span>
            <CogIcon className="h-4 w-4" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
              <UserCircleIcon className="h-4 w-4" />
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                Demo User
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 