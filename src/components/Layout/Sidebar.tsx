import React, { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';
import { useMobile } from '@/hooks/useMobile';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '#dashboard', icon: '⊞' },
  { label: 'Send XLM', href: '#send', icon: '↑' },
  { label: 'History', href: '#history', icon: '◷' },
  { label: 'Contract', href: '#contract', icon: '◈' },
  { label: 'Events', href: '#events', icon: '◉' },
];

export function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useUiStore();
  const isMobile = useMobile();

  // Close sidebar on desktop resize
  useEffect(() => {
    if (!isMobile && isSidebarOpen) closeSidebar();
  }, [isMobile, isSidebarOpen, closeSidebar]);

  if (!isMobile) return null;

  return (
    <>
      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 bg-[#0A0C16] border-r border-[rgba(123,97,255,0.1)] transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <a
              key={item.label}
              href={item.href}
              onClick={closeSidebar}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#7B61FF]/10 transition-colors"
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[10px] text-[#4B5563] text-center">StellarPay Pro v3.0 · Testnet</p>
        </div>
      </aside>
    </>
  );
}
