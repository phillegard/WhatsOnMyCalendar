import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ErrorBoundary } from '../common/ErrorBoundary';

export function Layout(): React.ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  function toggleSidebar(): void {
    setSidebarOpen(!sidebarOpen);
  }

  function toggleMobileSidebar(): void {
    setMobileSidebarOpen(!mobileSidebarOpen);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar for desktop */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} hidden md:block transition-all duration-300 ease-in-out`}>
        <Sidebar 
          isCollapsed={!sidebarOpen} 
          toggleSidebar={toggleSidebar} 
        />
      </div>

      {/* Mobile sidebar - overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={toggleMobileSidebar}
        />
      )}
      
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar 
          isCollapsed={false} 
          toggleSidebar={toggleMobileSidebar} 
          isMobile={true}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header toggleSidebar={toggleMobileSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}