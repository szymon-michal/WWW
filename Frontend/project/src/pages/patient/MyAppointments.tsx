import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, MapPin, Phone, CreditCard as Edit, Trash2 } from 'lucide-react';
import { apiClient, queryKeys } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDateTime, formatDate } from '../../lib/utils';

export const MyAppointments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const { data: appointments, isLoading } = useQuery({
    queryKey: queryKeys.myAppointments,
    queryFn: apiClient.getMyAppointments,
  });

  // Mock data for demo
  const mockAppointments = [
    {
      id: '1',
      appointmentDate: '2025-11-15T14:30:00Z',
      type: 'Regular Checkup',
      status: 'CONFIRMED',
      duration: 60,
      dentist: { firstName: 'Sarah', lastName: 'Smith' },
      notes: 'Routine cleaning and examination',
    },
    {
      id: '2',
      appointmentDate: '2025-12-20T09:00:00Z',
      type: 'Filling',
      status: 'SCHEDULED',
      duration: 90,
      dentist: { firstName: 'John', lastName: 'Wilson' },
      notes: 'Composite filling for tooth 14',
    },
    {
      id: '3',
      appointmentDate: '2025-10-15T10:00:00Z',
      type: 'Cleaning',
      status: 'COMPLETED',
      duration: 45,
      dentist: { firstName: 'Sarah', lastName: 'Smith' },
      notes: 'Regular cleaning completed',
    },
    {
      id: '4',
      appointmentDate: '2025-09-10T15:30:00Z',
      type: 'Consultation',
      status: 'COMPLETED',
      duration: 30,
      dentist: { firstName: 'Emily', lastName: 'Johnson' },
      notes: 'Initial consultation and treatment planning',
    },
  ];

  const upcomingAppointments = mockAppointments.filter(apt => 
    apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
  );

  const pastAppointments = mockAppointments.filter(apt => 
    apt.status === 'COMPLETED' || apt.status === 'CANCELLED'
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const AppointmentCard: React.FC<{ appointment: any; isUpcoming: boolean }> = ({ 
    appointment, 
    isUpcoming 
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{appointment.type}</h3>
                <p className="text-sm text-gray-500">
                  {formatDateTime(appointment.appointmentDate)}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2" />
                Dr. {appointment.dentist.firstName} {appointment.dentist.lastName}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {appointment.duration} minutes
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                Room 102, Main Building
              </div>
            </div>

            {appointment.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{appointment.notes}</p>
              </div>
            )}
          </div>

          <div className="ml-4 flex flex-col items-end space-y-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
              {appointment.status.replace('_', ' ')}
            </span>

            {isUpcoming && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Reschedule
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="mt-2 text-gray-600">
          Manage your dental appointments and view appointment history.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History ({pastAppointments.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Book New Appointment Button */}
      <div className="mb-6">
        <Button className="inline-flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Book New Appointment
        </Button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {activeTab === 'upcoming' ? (
          <>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                  isUpcoming={true} 
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Upcoming Appointments
                  </h3>
                  <p className="text-gray-500 mb-4">
                    You don't have any scheduled appointments.
                  </p>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule an Appointment
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id} 
                  appointment={appointment} 
                  isUpcoming={false} 
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Appointment History
                  </h3>
                  <p className="text-gray-500">
                    Your completed appointments will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};