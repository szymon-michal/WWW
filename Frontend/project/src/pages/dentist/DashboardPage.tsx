import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Clock } from 'lucide-react';
import { apiClient, queryKeys } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDateTime, getInitials } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: patients, isLoading: patientsLoading, error: patientsError } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => apiClient.getAllPatients(),
  });

  const { data: allAppointments, isLoading: appointmentsLoading, error: appointmentsError } = useQuery({
    queryKey: queryKeys.dentistAppointments,
    queryFn: () => apiClient.getDentistAppointments(),
  });

  const { data: todayAppointments, isLoading: todayLoading, error: todayError } = useQuery({
    queryKey: queryKeys.dentistTodayAppointments,
    queryFn: () => apiClient.getDentistTodayAppointments(),
  });

  if (patientsLoading || appointmentsLoading || todayLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (patientsError || appointmentsError || todayError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error loading dashboard data</p>
          <p className="text-sm text-gray-600">{(patientsError || appointmentsError || todayError)?.toString()}</p>
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const scheduledAppointments = (allAppointments || []).filter(
    apt => apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
  );
  
  const completedToday = (todayAppointments || []).filter(
    apt => apt.status === 'COMPLETED'
  ).length;
  
  const remainingToday = (todayAppointments || []).filter(
    apt => apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
  ).length;

  const stats = {
    totalPatients: patients?.length || 0,
    todayAppointments: todayAppointments?.length || 0,
    pendingTreatments: scheduledAppointments.length,
    completedToday,
    remainingToday,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, Dr. {user?.lastName || 'Doctor'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Patients</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalPatients}</div>
            <p className="text-xs text-blue-600">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Today's Appointments</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.todayAppointments}</div>
            <p className="text-xs text-green-600">
              {stats.completedToday} completed, {stats.remainingToday} remaining
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Pending Treatments</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.pendingTreatments}</div>
            <p className="text-xs text-purple-600">
              Scheduled appointments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(todayAppointments || []).map((appointment) => {
                const patientName = `${appointment.patientProfile?.firstName || 'Unknown'} ${appointment.patientProfile?.lastName || 'Patient'}`;
                const appointmentTime = new Date(appointment.appointmentDate).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                });
                
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm font-medium text-white">
                          {getInitials(appointment.patientProfile?.firstName || 'U', appointment.patientProfile?.lastName || 'P')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {patientName}
                        </p>
                        <p className="text-sm text-green-600 font-medium">{appointment.appointmentType}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                      <div className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                        {appointmentTime}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!todayAppointments || todayAppointments.length === 0) && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Treatments */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 text-purple-600 mr-2" />
              Pending Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledAppointments
                .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                .slice(0, 5)
                .map((appointment) => {
                const patientName = `${appointment.patientProfile?.firstName || 'Unknown'} ${appointment.patientProfile?.lastName || 'Patient'}`;
                const appointmentDate = new Date(appointment.appointmentDate);
                const isUpcoming = appointmentDate > new Date();
                const formattedDate = appointmentDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: appointmentDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                });
                const formattedTime = appointmentDate.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                });
                
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm font-medium text-white">
                          {getInitials(appointment.patientProfile?.firstName || 'U', appointment.patientProfile?.lastName || 'P')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {patientName}
                        </p>
                        <p className="text-sm text-purple-600 font-medium">{appointment.appointmentType}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                      <div className="text-xs font-semibold text-purple-700">
                        {formattedDate} • {formattedTime}
                      </div>
                    </div>
                  </div>
                );
              })}
              {scheduledAppointments.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending treatments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};