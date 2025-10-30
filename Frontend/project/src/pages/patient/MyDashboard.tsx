import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Heart, CreditCard, FileText, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient, queryKeys } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDateTime, formatDate, formatCurrency } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const MyDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: queryKeys.myProfile,
    queryFn: apiClient.getMyProfile,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: queryKeys.myAppointments,
    queryFn: apiClient.getMyAppointments,
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: queryKeys.myPlans,
    queryFn: apiClient.getMyTreatmentPlans,
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Mock data for demo
  const nextAppointment = {
    id: '1',
    date: '2025-11-15T14:30:00Z',
    doctor: 'Dr. Sarah Smith',
    type: 'Regular Checkup',
    location: 'Room 102',
  };

  const quickStats = {
    nextAppointment: nextAppointment,
    activeRreatmentPlans: plans?.filter(p => p.status === 'ACTIVE').length || 0,
    pendingPayments: 350.00,
    lastVisit: '2025-10-15T10:00:00Z',
  };

  const recommendations = [
    'Schedule your next cleaning appointment',
    'Complete your fluoride treatment',
    'Review your home care routine',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your dental health and upcoming appointments.
        </p>
      </div>

      {/* Next Appointment Card */}
      {quickStats.nextAppointment && (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Next Appointment</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatDateTime(quickStats.nextAppointment.date)}
                  </p>
                  <p className="text-gray-600">
                    {quickStats.nextAppointment.type} with {quickStats.nextAppointment.doctor}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {quickStats.nextAppointment.location}
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm">
                  Reschedule
                </Button>
                <Button size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link to="/my/appointments" className="group">
          <Card className="transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
                Book Appointment
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Schedule your next visit
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/my/health" className="group">
          <Card className="transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
            <CardContent className="p-6 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 group-hover:text-red-500">
                My Treatment Plan
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                View current treatments
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/my/billing" className="group">
          <Card className="transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
            <CardContent className="p-6 text-center">
              <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                My Payments
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                View bills and payments
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/my/health" className="group">
          <Card className="transition-all duration-200 group-hover:shadow-lg group-hover:scale-105">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">
                Health Records
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Access dental records
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Health Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              Health Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Treatment Plans</span>
                <span className="font-semibold">{quickStats.activeRreatmentPlans}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Visit</span>
                <span className="font-semibold">{formatDate(quickStats.lastVisit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Next Cleaning Due</span>
                <span className="font-semibold">March 2025</span>
              </div>
              <div className="pt-4 border-t">
                <Link to="/my/health">
                  <Button variant="outline" className="w-full">
                    View Full Health Record
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              Financial Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Outstanding Balance</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(quickStats.pendingPayments)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Year Paid</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(1250.00)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Insurance Coverage</span>
                <span className="font-semibold">80%</span>
              </div>
              <div className="pt-4 border-t space-y-2">
                <Button variant="secondary" className="w-full">
                  Pay Outstanding Balance
                </Button>
                <Link to="/my/billing">
                  <Button variant="outline" className="w-full">
                    View All Invoices
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 text-purple-600 mr-2" />
              Doctor's Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                View All Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Appointment Confirmed</p>
                  <p className="text-sm text-gray-500">November 15, 2025 at 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Treatment Plan Updated</p>
                  <p className="text-sm text-gray-500">November 1, 2025</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Payment Received</p>
                  <p className="text-sm text-gray-500">October 28, 2025</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};