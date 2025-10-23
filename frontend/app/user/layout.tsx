'use client'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

// export const metadata = {
//   title: 'FishDelivery - Fresh Fish at Your Doorstep',
//   description: 'Get fresh fish delivered directly from our mobile fish markets. Track vehicles in real-time and place orders effortlessly.',
// }

function Guard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Child layouts must NOT render <html> or <body>. Those are only allowed
  // in the root app/layout.tsx. Return a fragment/div wrapper instead.
  return (
    <div className={`${inter.className} h-full antialiased bg-gray-50`}>
      <AuthProvider>
        <Guard>{children}</Guard>
      </AuthProvider>
    </div>
  )
}