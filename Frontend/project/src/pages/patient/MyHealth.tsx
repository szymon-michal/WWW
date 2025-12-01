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
  const { data: dentalRecord, isLoading: recordLoading, error } = useQuery({
    queryKey: queryKeys.myRecord,
    queryFn: () => apiClient.getMyRecord(),
  });

  console.log('MyHealth - dentalRecord:', dentalRecord);
  console.log('MyHealth - loading:', recordLoading);
  console.log('MyHealth - error:', error);

  // Convert dental chart to tooth array format for display
  const getTeethFromDentalChart = (dentalChart: any) => {
    if (!dentalChart) return [];
    
    try {
      const teeth: any[] = [];
      
      // All 32 permanent teeth (FDI notation)
      // Upper right: 18,17,16,15,14,13,12,11
      // Upper left: 21,22,23,24,25,26,27,28
      // Lower left: 31,32,33,34,35,36,37,38
      // Lower right: 48,47,46,45,44,43,42,41
      const allTeethNumbers = [
        18, 17, 16, 15, 14, 13, 12, 11, // Upper right
        21, 22, 23, 24, 25, 26, 27, 28, // Upper left
        31, 32, 33, 34, 35, 36, 37, 38, // Lower left
        48, 47, 46, 45, 44, 43, 42, 41, // Lower right
      ];
      
      allTeethNumbers.forEach(toothNumber => {
        const toothKey = `tooth_${toothNumber}`;
        const surfaces = dentalChart[toothKey];
        
        if (surfaces) {
          const statuses = Object.values(surfaces as Record<string, string>);
          
          // Determine primary status from surfaces
          let status = 'HEALTHY';
          if (statuses.includes('MISSING')) status = 'MISSING';
          else if (statuses.includes('CROWN')) status = 'CROWN';
          else if (statuses.includes('FILLING')) status = 'FILLING';
          else if (statuses.includes('CARIES')) status = 'CARIES';
          else if (statuses.includes('PLAQUE')) status = 'PLAQUE';
          
          teeth.push({
            toothNumber,
            status,
            surfaces: surfaces,
          });
        } else {
          // Tooth not in chart = healthy
          teeth.push({
            toothNumber,
            status: 'HEALTHY',
            surfaces: {},
          });
        }
      });
      
      return teeth;
    } catch (err) {
      console.error('Error parsing dental chart:', err);
      return [];
    }
  };

  const teeth = dentalRecord ? getTeethFromDentalChart(dentalRecord.dentalChart) : [];
  const xrayFiles = dentalRecord?.attachments || [];
  
  // Transform dentalRecord for ToothChart component
  const toothChartData = dentalRecord ? {
    ...dentalRecord,
    teeth: teeth
  } : undefined;

  if (recordLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Health Records</h2>
          <p className="text-gray-600">{(error as any)?.message || 'Failed to load dental records'}</p>
        </div>
      </div>
    );
  }

  // Prepare display data
  const recordNotes = dentalRecord?.generalNotes?.length > 0 
    ? dentalRecord.generalNotes[dentalRecord.generalNotes.length - 1].note 
    : 'No clinical notes available';

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
                {teeth.filter(t => t.status === 'HEALTHY').length}
              </div>
              <div className="text-sm text-gray-500">Healthy Teeth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {teeth.filter(t => t.status === 'CARIES').length}
              </div>
              <div className="text-sm text-gray-500">Cavities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {teeth.filter(t => t.status === 'FILLING').length}
              </div>
              <div className="text-sm text-gray-500">Fillings</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Doctor's Notes</h4>
            <p className="text-blue-800">{recordNotes}</p>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Last updated: {dentalRecord?.updatedAt ? formatDate(dentalRecord.updatedAt) : 'N/A'}
          </div>
        </CardContent>
      </Card>

      {/* Dental Chart */}
      <div className="mb-8">
        <ToothChart dentalRecord={toothChartData} readOnly={true} />
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
              {xrayFiles.map((file: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileImage className="h-5 w-5 text-gray-400 mr-2" />
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        file.type === 'PANTOMOGRAPHIC' || file.type === 'XRAY'
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {file.type || 'IMAGE'}
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
                    {file.type === 'PANTOMOGRAPHIC' ? 'Panoramic X-ray' : file.type === 'INTRAORAL' ? 'Intraoral photograph' : 'Medical image'}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {file.uploadedAt ? formatDate(file.uploadedAt) : 'N/A'}
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