import React, { useState, useEffect } from 'react';
import { Users, Trash2, Edit2, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { User as ApiUser } from '../../types/api';

interface FormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dentists' | 'patients'>('dentists');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dentists, setDentists] = useState<ApiUser[]>([]);
  const [patients, setPatients] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  // Load users on component mount and when tab changes
  useEffect(() => {
    if (user?.id) {
      loadUsers();
    }
  }, [activeTab, user?.id]);

  const loadUsers = async () => {
    try {
      setInitialLoading(true);
      setError('');
      if (activeTab === 'dentists') {
        console.log('Loading dentists...');
        const data = await apiClient.getAllDentists();
        console.log('Dentists loaded:', data);
        setDentists(data);
      } else {
        console.log('Loading patients...');
        const data = await apiClient.getAllPatientUsers();
        console.log('Patients loaded:', data);
        setPatients(data);
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err?.message || 'Failed to load users. Make sure backend endpoints are available.');
      if (activeTab === 'dentists') {
        setDentists([]);
      } else {
        setPatients([]);
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'dentists') {
        if (editingId) {
          await apiClient.updateDentist(editingId, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            ...(formData.password && { password: formData.password }),
          });
        } else {
          await apiClient.createDentist(formData);
        }
      } else {
        if (editingId) {
          await apiClient.updatePatientUser(editingId, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            ...(formData.password && { password: formData.password }),
          });
        } else {
          await apiClient.createPatient(formData);
        }
      }

      await loadUsers();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: ApiUser) => {
    setFormData({
      username: user.email, // Use email as username for now
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (activeTab === 'dentists') {
        await apiClient.deleteDentist(id);
      } else {
        await apiClient.deletePatientUser(id);
      }
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const users = activeTab === 'dentists' ? dentists : patients;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage dentists and patients</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('dentists');
            resetForm();
          }}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === 'dentists'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="inline-block w-5 h-5 mr-2" />
          Dentists
        </button>
        <button
          onClick={() => {
            setActiveTab('patients');
            resetForm();
          }}
          className={`px-4 py-2 font-medium border-b-2 ${
            activeTab === 'patients'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="inline-block w-5 h-5 mr-2" />
          Patients
        </button>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        {!showForm && (
          <Button
            onClick={() => {
              setFormData({
                username: '',
                firstName: '',
                lastName: '',
                email: '',
                password: '',
              });
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab === 'dentists' ? 'Dentist' : 'Patient'}
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="username"
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                required
              />
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Doe"
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={editingId ? 'Leave blank to keep current' : 'Enter password'}
                required={!editingId}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" isLoading={loading}>
                {editingId ? 'Update' : 'Create'} {activeTab === 'dentists' ? 'Dentist' : 'Patient'}
              </Button>
              <Button type="button" onClick={resetForm} className="bg-gray-300 hover:bg-gray-400">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Users List */}
      <Card>
        {initialLoading ? (
          <div className="px-6 py-8 text-center text-gray-500">
            Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No {activeTab} found
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          disabled={loading}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center disabled:opacity-50"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
