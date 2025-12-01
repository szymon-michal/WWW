import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { apiClient, queryKeys } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDateTime, getInitials } from '../../lib/utils';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: apiClient.getAllPatients,
  });

  if (patientsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Generate pseudo-random but consistent data per dentist
  const getDentistSeed = () => {
    if (!user?.id) return 0;
    return user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  };

  const seed = getDentistSeed();
  
  // Different mock appointments per dentist
  const allAppointments = [
    [
      { id: '1', time: '09:00', patient: { firstName: 'John', lastName: 'Doe' }, type: 'Cleaning' },
      { id: '2', time: '10:30', patient: { firstName: 'Jane', lastName: 'Smith' }, type: 'Root Canal' },
      { id: '3', time: '14:00', patient: { firstName: 'Bob', lastName: 'Johnson' }, type: 'Consultation' },
    ],
    [
      { id: '1', time: '08:30', patient: { firstName: 'Alice', lastName: 'Williams' }, type: 'Checkup' },
      { id: '2', time: '11:00', patient: { firstName: 'Michael', lastName: 'Brown' }, type: 'Filling' },
    ],
    [
      { id: '1', time: '10:00', patient: { firstName: 'Sarah', lastName: 'Davis' }, type: 'Crown Fitting' },
      { id: '2', time: '13:00', patient: { firstName: 'David', lastName: 'Miller' }, type: 'Extraction' },
      { id: '3', time: '15:30', patient: { firstName: 'Emma', lastName: 'Wilson' }, type: 'Cleaning' },
      { id: '4', time: '16:30', patient: { firstName: 'James', lastName: 'Moore' }, type: 'Consultation' },
    ],
  ];

  const todayAppointments = allAppointments[seed % allAppointments.length];
  
  // Different stats per dentist
  const baseRevenue = 12000 + (seed % 8) * 1500;
  const basePending = 8 + (seed % 12);

  const stats = {
    totalPatients: patients?.length || 0,
    todayAppointments: todayAppointments.length,
    pendingTreatments: basePending,
    revenue: baseRevenue,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, Dr. {user?.lastName || 'Doctor'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              3 completed, 0 remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Treatments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTreatments}</div>
            <p className="text-xs text-muted-foreground">
              Across 8 patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PLN {stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {getInitials(appointment.patient.firstName, appointment.patient.lastName)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {appointment.time}
                  </div>
                </div>
              ))}
              {todayAppointments.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients?.slice(0, 5).map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {getInitials(patient.firstName, patient.lastName)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(patient.createdAt)}
                  </div>
                </div>
              ))}
              {(!patients || patients.length === 0) && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No patients registered yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};