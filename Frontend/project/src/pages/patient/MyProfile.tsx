import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, Calendar, CreditCard, Shield, Eye, EyeOff, Check } from 'lucide-react';
import { apiClient, queryKeys } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { calculateAge, validateEmail } from '../../lib/utils';

export const MyProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [consents, setConsents] = useState({
    marketing: true,
    dataProcessing: true,
    thirdParty: false,
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationalId: '',
    address: '',
    emergencyContact: '',
    insuranceNumber: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.myProfile,
    queryFn: () => apiClient.getMyProfile(),
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.contactPhone || profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        nationalId: profile.nationalId || '',
        address: profile.address || '',
        emergencyContact: profile.emergencyContact || '',
        insuranceNumber: profile.insuranceNumber || profile.insuranceDetails || '',
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<typeof formData>) => 
      apiClient.updatePatient(profile?.id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
      setIsEditing(false);
      setErrors({});
    },
    onError: (error: any) => {
      setErrors({ general: error.message || 'Failed to update profile' });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordChange = () => {
    if (!validatePasswordForm()) return;
    // In a real app, this would call an API to change the password
    console.log('Password change requested');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordSection(false);
    setErrors({});
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.contactPhone || profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        nationalId: profile.nationalId || '',
        address: profile.address || '',
        emergencyContact: profile.emergencyContact || '',
        insuranceNumber: profile.insuranceNumber || profile.insuranceDetails || '',
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Profile Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-500 mr-2" />
              Personal Information
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!isEditing}
                error={errors.firstName}
              />

              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
                error={errors.lastName}
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                error={errors.email}
              />

              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!isEditing}
              />

              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                disabled={!isEditing}
                error={errors.dateOfBirth}
                helper={formData.dateOfBirth ? `Age: ${calculateAge(formData.dateOfBirth)}` : undefined}
              />

              <Input
                label="PESEL (National ID)"
                value={formData.nationalId}
                onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                disabled={!isEditing}
                helper="11-digit Polish national identification number"
              />

              <Input
                label="Insurance Number"
                value={formData.insuranceNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, insuranceNumber: e.target.value }))}
                disabled={!isEditing}
                className="md:col-span-2"
              />

              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                disabled={!isEditing}
                className="md:col-span-2"
              />

              <Input
                label="Emergency Contact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                disabled={!isEditing}
                className="md:col-span-2"
                helper="Name and phone number of emergency contact"
              />
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={updateProfileMutation.isPending}
                  disabled={updateProfileMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 text-green-500 mr-2" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showPasswordSection ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordSection(true)}
                >
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline">
                  Enable 2FA
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Change Password</h4>
              
              <div className="relative">
                <Input
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  error={errors.currentPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  error={errors.newPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  error={errors.confirmPassword}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-gray-400"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handlePasswordChange}>
                  Update Password
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Check className="h-5 w-5 text-purple-500 mr-2" />
            Privacy & Consents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Marketing Communications</h4>
                <p className="text-sm text-gray-500">Receive appointment reminders and health tips</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.marketing}
                  onChange={(e) => setConsents(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">{consents.marketing ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Data Processing</h4>
                <p className="text-sm text-gray-500">Allow processing of health data for treatment</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.dataProcessing}
                  onChange={(e) => setConsents(prev => ({ ...prev, dataProcessing: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">{consents.dataProcessing ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Third-party Sharing</h4>
                <p className="text-sm text-gray-500">Share data with insurance providers</p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={consents.thirdParty}
                  onChange={(e) => setConsents(prev => ({ ...prev, thirdParty: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">{consents.thirdParty ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t mt-6">
            <div className="flex space-x-4">
              <Button variant="outline" size="sm">
                Download My Data
              </Button>
              <Button variant="outline" size="sm">
                Delete Account
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Account deletion is permanent and cannot be undone. Contact support for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};