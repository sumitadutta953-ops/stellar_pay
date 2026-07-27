import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from '@/components/Layout/Header';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Footer } from '@/components/Layout/Footer';
import { Dashboard } from '@/components/Dashboard/Dashboard';
import { ToastContainer } from '@/components/Common/Toast';
import { ErrorBoundary } from '@/components/Common/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-mesh text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-purple-500/30">
        {/* Dynamic ambient glowing orbs */}
        <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-float" />
        <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse-glow" />
        <div className="fixed top-[40%] left-[60%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-float" style={{ animationDelay: '2s' }} />

        <ErrorBoundary>
          <Header />
          <Sidebar />
          <Dashboard />
          <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 relative z-10">
            <Footer />
          </div>
        </ErrorBoundary>

        <ToastContainer />
      </div>
    </QueryClientProvider>
  );
}
