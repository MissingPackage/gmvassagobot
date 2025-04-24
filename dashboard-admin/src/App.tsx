import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import AdminDashboard from './AdminDashboard';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminDashboard />
    </QueryClientProvider>
  );
}
