import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Download, FileImage, Calendar } from 'lucide-react';
import { apiClient, queryKeys } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ToothChart } from '../../components/dental/ToothChart';
import { formatDate } from '../../lib/utils';

export const MyHealth: React.FC = () => {
  const { data: dentalRecord, isLoading: recordLoading } = useQuery({
    queryKey: queryKeys.myRecord,
    queryFn: apiClient.getMyRecord,
  });

  // Mock data for demo
  const mockRecord = {
    id: '1',
    patientId: '1',
    teeth: [
      {
        toothNumber: 11,
        status: 'FILLING' as const,
        surfaces: [],
        notes: 'Composite filling completed',
        lastUpdated: '2025-10-15T10:00:00Z',
      },
      {
        toothNumber: 24,
        status: 'CARIES' as const,
        surfaces: [],
        notes: 'Small cavity detected',
        lastUpdated: '2025-10-20T14:30:00Z',
      },
      {
        toothNumber: 36,
        status: 'CROWN' as const,
        surfaces: [],
        notes: 'Porcelain crown placed',
        lastUpdated: '2025-09-10T11:00:00Z',
      },
    ],
    notes: 'Overall good oral health',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-10-20T14:30:00Z',
  };

  const xrayFiles = [
    {
      id: '1',
      filename: 'panoramic_xray_2025-10-15.jpg',
      fileType: 'XRAY',
      uploadDate: '2025-10-15T10:00:00Z',
      description: 'Panoramic X-ray - Routine checkup',
    },
    {
      id: '2',
      filename: 'bitewing_xray_2025-10-15.jpg',
      fileType: 'XRAY',
      uploadDate: '2025-10-15T10:00:00Z',
      description: 'Bitewing X-rays - Posterior teeth',
    },
    {
      id: '3',
      filename: 'clinical_photo_2025-09-10.jpg',
      fileType: 'PHOTO',
      uploadDate: '2025-09-10T11:00:00Z',
      description: 'Clinical photograph - Crown placement',
    },
  ];

  if (recordLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentRecord = dentalRecord || mockRecord;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Health Records</h1>
        <p className="mt-2 text-gray-600">
          View your dental chart, X-rays, and health information.
        </p>
      </div>

      {/* Health Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 text-red-500 mr-2" />
            Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentRecord.teeth.filter(t => t.status === 'HEALTHY').length}
              </div>
              <div className="text-sm text-gray-500">Healthy Teeth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {currentRecord.teeth.filter(t => t.status === 'CARIES').length}
              </div>
              <div className="text-sm text-gray-500">Cavities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentRecord.teeth.filter(t => t.status === 'FILLING').length}
              </div>
              <div className="text-sm text-gray-500">Fillings</div>
            </div>
          </div>
          
          {currentRecord.notes && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Doctor's Notes</h4>
              <p className="text-blue-800">{currentRecord.notes}</p>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            Last updated: {formatDate(currentRecord.updatedAt)}
          </div>
        </CardContent>
      </Card>

      {/* Dental Chart */}
      <div className="mb-8">
        <ToothChart dentalRecord={currentRecord} readOnly={true} />
      </div>

      {/* X-rays and Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileImage className="h-5 w-5 text-purple-500 mr-2" />
              My X-rays & Images
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {xrayFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {xrayFiles.map((file) => (
                <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileImage className="h-5 w-5 text-gray-400 mr-2" />
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        file.fileType === 'XRAY' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {file.fileType}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-2 truncate">
                    {file.filename}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {file.description}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(file.uploadDate)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileImage className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Images Available
              </h3>
              <p className="text-gray-500">
                X-rays and clinical photos will appear here after your appointments.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};