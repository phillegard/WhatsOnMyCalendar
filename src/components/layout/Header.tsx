import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Plus, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <header className="border-b border-gray-200 bg-white px-4 py-2 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button 
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="input !h-9 w-64 pl-9"
            />
            <Search 
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" 
              aria-hidden="true" 
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <div className="relative">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                3
              </span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Notifications</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <a href="#" className="flex items-start px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">T</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">Task "Complete project proposal" is due tomorrow</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-start px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-green-700">M</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">Meeting with Marketing team in 30 minutes</p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </a>
                    <a href="#" className="flex items-start px-4 py-3 hover:bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">J</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">John commented on your task</p>
                        <p className="text-xs text-gray-500">3 hours ago</p>
                      </div>
                    </a>
                  </div>
                  <div className="border-t border-gray-100">
                    <a href="#" className="block px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-100">
                      View all notifications
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              <span className="text-sm font-medium">
                {user?.email?.[0].toUpperCase()}
              </span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Logged in as</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <User size={16} className="mr-2" />
                    Profile
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <HelpCircle size={16} className="mr-2" />
                    Help & Support
                  </a>
                  <div className="border-t border-gray-100">
                    <button 
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}