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
    queryFn: () => apiClient.getMyProfile(),
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: queryKeys.myAppointments,
    queryFn: () => apiClient.getMyAppointments(),
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: queryKeys.myPlans,
    queryFn: () => apiClient.getMyTreatmentPlans(),
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: queryKeys.myInvoices,
    queryFn: () => apiClient.getMyInvoices(),
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Get next upcoming appointment
  const upcomingAppointments = (appointments || [])
    .filter((apt: any) => apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED')
    .sort((a: any, b: any) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  
  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  // Financials based on DB
  const activeTreatmentPlans = (plans || []).filter((p: any) => p.status === 'ACTIVE').length;
  const activePlan = (plans || [])
    .slice()
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const totalTreatmentCost = (activePlan?.procedures || [])
    .reduce((sum: number, p: any) => sum + Number(p?.costEstimate ?? 0), 0);
  const paidInvoices = (invoices || []).filter((inv: any) => String(inv.status).toUpperCase() === 'PAID');
  const totalPaid = paidInvoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount ?? 0), 0);
  const totalOutstanding = Math.max(totalTreatmentCost - totalPaid, 0);

  const currentYear = new Date().getFullYear();
  const thisYearPaid = paidInvoices
    .filter((inv: any) => {
      const d = inv.issueDate || inv.createdAt;
      if (!d) return false;
      const year = new Date(d).getFullYear();
      return year === currentYear;
    })
    .reduce((sum: number, inv: any) => sum + Number(inv.totalAmount ?? 0), 0);

  // Last visit from completed appointments
  const lastVisitApt = (appointments || [])
    .filter((apt: any) => apt.status === 'COMPLETED')
    .sort((a: any, b: any) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())[0];
  const lastVisit = lastVisitApt?.appointmentDate || null;

  const quickStats = {
    nextAppointment: nextAppointment,
    activeTreatmentPlans,
    pendingPayments: totalOutstanding,
    lastVisit,
  };

  const recommendations = [
    'Schedule your next cleaning appointment',
    'Complete your fluoride treatment',
    'Review your home care routine',
  ];

  // Build Recent Activity feed from DB entities
  const appointmentEvents = (appointments || []).map((apt: any) => {
    const status = String(apt.status || '').toUpperCase();
    let label = 'Appointment';
    if (status === 'CONFIRMED') label = 'Appointment Confirmed';
    else if (status === 'SCHEDULED') label = 'Appointment Scheduled';
    else if (status === 'COMPLETED') label = 'Appointment Completed';
    else if (status) label = `Appointment ${status[0]}${status.slice(1).toLowerCase()}`;
    return {
      type: 'appointment' as const,
      date: apt.appointmentDate,
      label,
      description: `${apt.appointmentType || 'Visit'}${apt.dentist?.lastName ? ` with Dr. ${apt.dentist.lastName}` : ''}`,
    };
  });

  const invoiceEvents = (invoices || []).map((inv: any) => {
    const status = String(inv.status || '').toUpperCase();
    const base = {
      type: (status === 'PAID' ? 'payment' : 'invoice') as const,
      date: inv.issueDate || inv.updatedAt || inv.createdAt,
      amount: Number(inv.totalAmount ?? 0),
      invoiceNumber: inv.invoiceNumber || `INV-${(inv.id || '').slice(-6).toUpperCase()}`,
    };
    if (status === 'PAID') {
      return { ...base, label: 'Payment Received', description: base.invoiceNumber };
    }
    return { ...base, label: 'Invoice Issued', description: base.invoiceNumber };
  });

  const planEvents = (plans || []).map((plan: any) => ({
    type: 'plan' as const,
    date: plan.updatedAt || plan.createdAt,
    label: 'Treatment Plan Updated',
    description: plan.title || plan.name || 'Treatment Plan',
  }));

  const events = [...appointmentEvents, ...invoiceEvents, ...planEvents]
    .filter(e => !!e.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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
                    {formatDateTime(quickStats.nextAppointment.appointmentDate)}
                  </p>
                  <p className="text-gray-600">
                    {quickStats.nextAppointment.appointmentType} with Dr. {quickStats.nextAppointment.dentist?.lastName || 'Doctor'}
                  </p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    Room 102, Main Building
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
                <span className="font-semibold">{quickStats.activeTreatmentPlans}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Visit</span>
                <span className="font-semibold">{quickStats.lastVisit ? formatDate(quickStats.lastVisit) : '—'}</span>
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
                  {formatCurrency(thisYearPaid)}
                </span>
              </div>
              <div className="pt-4 border-t space-y-2">
                <Link to="/my/billing">
                  <Button variant="secondary" className="w-full">
                    Pay Outstanding Balance
                  </Button>
                </Link>
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
              {events.map((ev, idx) => {
                const isAppt = ev.type === 'appointment';
                const isPayment = ev.type === 'payment';
                const isInvoice = ev.type === 'invoice';
                const iconWrapClass = isAppt
                  ? 'bg-green-100'
                  : isPayment
                  ? 'bg-purple-100'
                  : 'bg-blue-100';
                const iconEl = isAppt ? (
                  <Calendar className="h-4 w-4 text-green-600" />
                ) : isPayment ? (
                  <CreditCard className="h-4 w-4 text-purple-600" />
                ) : (
                  <FileText className="h-4 w-4 text-blue-600" />
                );
                return (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 ${iconWrapClass} rounded-full flex items-center justify-center`}>
                      {iconEl}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ev.label}</p>
                      <p className="text-sm text-gray-500">
                        {ev.description}
                        {isPayment && typeof (ev as any).amount === 'number' && (
                          <> • {formatCurrency((ev as any).amount)}</>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">{formatDateTime(ev.date)}</p>
                    </div>
                  </div>
                );
              })}

              {events.length === 0 && (
                <p className="text-gray-500">No recent activity yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};