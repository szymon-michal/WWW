import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, User, MapPin, Phone, CreditCard as Edit, Trash2, X } from 'lucide-react';
import { apiClient, queryKeys } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { formatDateTime, formatDate } from '../../lib/utils';

export const MyAppointments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>('');
  const [newDate, setNewDate] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedDentist, setSelectedDentist] = useState('');
  const [visitType, setVisitType] = useState('Regular Checkup');
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const { data: appointments, isLoading, error: queryError } = useQuery({
    queryKey: queryKeys.myAppointments,
    queryFn: () => apiClient.getMyAppointments(),
  });

  const { data: dentists } = useQuery({
    queryKey: ['dentists'],
    queryFn: () => apiClient.getAllDentists(),
  });

  console.log('MyAppointments - isLoading:', isLoading);
  console.log('MyAppointments - queryError:', queryError);
  console.log('MyAppointments - appointments data:', appointments);
  console.log('MyAppointments - appointments count:', appointments?.length);
  console.log('MyAppointments - dentists data:', dentists);
  console.log('MyAppointments - dentists count:', dentists?.length);

  const rescheduleMutation = useMutation({
    mutationFn: ({ appointmentId, newDate }: { appointmentId: string; newDate: string }) =>
      apiClient.rescheduleAppointment(appointmentId, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myAppointments });
      setShowRescheduleModal(false);
      setNewDate('');
      setError(null);
    },
    onError: (error: any) => {
      setError(error?.message || 'Failed to reschedule appointment');
    },
  });

  const bookMutation = useMutation({
    mutationFn: ({ dentistId, appointmentDate, appointmentType }: { dentistId: string; appointmentDate: string; appointmentType: string }) =>
      apiClient.bookAppointment(dentistId, appointmentDate, appointmentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myAppointments });
      setShowBookModal(false);
      setBookingDate('');
      setSelectedDentist('');
      setVisitType('Regular Checkup');
      setError(null);
    },
    onError: (error: any) => {
      setError(error?.message || 'Failed to book appointment');
    },
  });

  const handleRescheduleClick = (appointmentId: string, currentDate: string) => {
    setSelectedAppointmentId(appointmentId);
    // Convert current date to local datetime format for input (YYYY-MM-DDTHH:mm)
    const date = new Date(currentDate);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setNewDate(localDate);
    setShowRescheduleModal(true);
    setError(null);
  };

  const handleRescheduleSubmit = () => {
    if (!newDate) {
      setError('Please select a date and time');
      return;
    }
    
    // Convert local datetime to ISO format for backend
    const isoDate = new Date(newDate).toISOString();
    rescheduleMutation.mutate({ appointmentId: selectedAppointmentId, newDate: isoDate });
  };

  const handleBookSubmit = () => {
    if (!selectedDentist || !bookingDate || !visitType) {
      setError('Please fill in all fields');
      return;
    }
    const isoDate = new Date(bookingDate).toISOString();
    bookMutation.mutate({
      dentistId: selectedDentist,
      appointmentDate: isoDate,
      appointmentType: visitType,
    });
  };

  // Filter appointments by status
  const upcomingAppointments = (appointments || []).filter((apt: any) => 
    apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
  );

  const pastAppointments = (appointments || []).filter((apt: any) => 
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
  }) => {
    const dentistName = appointment.dentist 
      ? `Dr. ${appointment.dentist.firstName} ${appointment.dentist.lastName}`
      : 'Unknown Dentist';
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{appointment.appointmentType || appointment.type || 'Appointment'}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(appointment.appointmentDate)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {dentistName}
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {appointment.durationMinutes || appointment.duration || 30} minutes
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRescheduleClick(appointment.id, appointment.appointmentDate)}
                  >
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
  };

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
        <Button 
          onClick={() => {
            setShowBookModal(true);
            setError(null);
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            const localDate = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16);
            setBookingDate(localDate);
            // Set default dentist if available
            if (dentists && dentists.length > 0) {
              const firstDentist = dentists.find((d: any) => d.roles?.includes('ROLE_DENTIST'));
              if (firstDentist) setSelectedDentist(firstDentist.id);
            }
          }}
          className="inline-flex items-center"
        >
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

      {/* Reschedule Modal */}
      <Modal isOpen={showRescheduleModal} onClose={() => setShowRescheduleModal(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Reschedule Appointment</h2>
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Date and Time
              </label>
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowRescheduleModal(false)}
                disabled={rescheduleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRescheduleSubmit}
                disabled={rescheduleMutation.isPending}
              >
                {rescheduleMutation.isPending ? 'Rescheduling...' : 'Reschedule'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Book Appointment Modal */}
      <Modal isOpen={showBookModal} onClose={() => setShowBookModal(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Book New Appointment</h2>
            <button
              onClick={() => setShowBookModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Dentist
              </label>
              <select
                value={selectedDentist}
                onChange={(e) => setSelectedDentist(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose a dentist...</option>
                {dentists?.filter((d: any) => d.roles?.includes('ROLE_DENTIST')).map((dentist: any) => (
                  <option key={dentist.id} value={dentist.id}>
                    Dr. {dentist.firstName} {dentist.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Type
              </label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Regular Checkup">Regular Checkup</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Consultation">Consultation</option>
                <option value="Emergency">Emergency</option>
                <option value="Follow-up">Follow-up</option>
                <option value="X-Ray">X-Ray</option>
                <option value="Root Canal">Root Canal</option>
                <option value="Crown Placement">Crown Placement</option>
                <option value="Filling">Filling</option>
                <option value="Extraction">Extraction</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date and Time
              </label>
              <input
                type="datetime-local"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowBookModal(false)}
                disabled={bookMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBookSubmit}
                disabled={bookMutation.isPending}
              >
                {bookMutation.isPending ? 'Booking...' : 'Book Appointment'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};