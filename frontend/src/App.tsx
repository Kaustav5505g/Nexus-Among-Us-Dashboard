import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';

const AmongUsAdmin = lazy(() => import('./pages/AmongUsAdmin'));

export default function App() {
  return (
    <AdminAuthProvider>
      <Router>
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#f6f4ee] paper-grid flex items-center justify-center font-mono text-xs text-neutral-800">
              <div className="p-4 border-2 border-neutral-900 bg-white shadow-[4px_4px_0px_#111111] flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                <span>LOADING NEXUS ALLOCATION OPERATIONS...</span>
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<AmongUsAdmin />} />
            <Route path="/admin" element={<AmongUsAdmin />} />
            <Route path="/dashboard" element={<AmongUsAdmin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AdminAuthProvider>
  );
}
