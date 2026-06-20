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
      <div className="min-h-screen bg-gradient-to-b from-[#070911] to-[#0D0F1A] text-[#F9FAFB] flex flex-col relative overflow-x-hidden">
        {/* Ambient background glows */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#7B61FF]/4 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-72 h-72 bg-[#10B981]/3 rounded-full blur-[100px] pointer-events-none" />

        <ErrorBoundary>
          <Header />
          <Sidebar />
          <Dashboard />
          <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8">
            <Footer />
          </div>
        </ErrorBoundary>

        <ToastContainer />
      </div>
    </QueryClientProvider>
  );
}
