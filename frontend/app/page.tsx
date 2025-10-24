'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Shield,
  Fish,
  Users,
  Star,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push(`/${user.role}/dashboard`);
    }
  }, [isAuthenticated, user, router]);

  const features = [
    {
      icon: Truck,
      title: 'Live Vehicle Tracking',
      description: 'Track fish delivery vehicles in real-time with live location updates'
    },
    {
      icon: MapPin,
      title: 'Smart Stop Requests',
      description: 'Request stops at your location and get notified when vehicles are nearby'
    },
    {
      icon: Clock,
      title: 'Pre-booking & Scheduling',
      description: 'Book your fish in advance and schedule deliveries at your convenience'
    },
    {
      icon: Shield,
      title: 'Hygienic & Fresh',
      description: 'Guaranteed fresh fish delivered directly from the source to you'
    }
  ];

  const stats = [
    { number: '50+', label: 'Active Vehicles' },
    { number: '1000+', label: 'Happy Customers' },
    { number: '5000+', label: 'Orders Delivered' },
    { number: '24/7', label: 'Customer Support' }
  ];

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-primary-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Fish className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MeenVandi</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button onClick={() => router.push('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Fresh Fish
            <span className="text-primary-600 block">Delivered to You</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Track mobile fish markets in real-time, request stops near you, and get the freshest catch delivered right to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => router.push('/register')}
              className="text-lg px-8 py-3"
            >
              Start Tracking Vehicles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/login')}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose FishDelivery?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of fish shopping with our innovative delivery system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center">
                <CardHeader>
                  <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Vehicles</h3>
              <p className="text-gray-600">
                See all active fish delivery vehicles on the live map in real-time
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Request Stop</h3>
              <p className="text-gray-600">
                Ask the vehicle to stop near your location or pre-book your order
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Fresh Fish</h3>
              <p className="text-gray-600">
                Receive fresh, hygienic fish directly from the mobile market
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Fresh Fish Delivery?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied customers and get the freshest fish delivered to you.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => router.push('/register')}
            className="text-lg px-8 py-3"
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Fish className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">FishDelivery</span>
            </div>
            <p className="text-gray-400 mb-4">
              Fresh fish delivered to your doorstep with real-time tracking
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 FishDelivery. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}