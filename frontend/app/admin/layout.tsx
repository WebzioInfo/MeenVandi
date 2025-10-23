import React from 'react';
// Admin layout: do not render <html> or <body> here — root layout already does that.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {children}
      </div>
    </div>
  );
}
