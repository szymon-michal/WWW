import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, queryKeys } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ToothChart } from '../../components/dental/ToothChart';
import { formatDate } from '../../lib/utils';
import { ArrowLeft, Upload, Image as ImageIcon, User } from 'lucide-react';

const DEFAULT_SURFACES = ['occlusal', 'buccal', 'lingual', 'mesial', 'distal'];

export const PatientDetailsPage: React.FC = () => {
  const { id: patientId } = useParams();
  const queryClient = useQueryClient();

  const { data: patient, isLoading: loadingProfile } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => apiClient.getPatientById(patientId!),
    enabled: !!patientId,
  });

  const { data: record, isLoading: loadingRecord } = useQuery({
    queryKey: ['patient', patientId, 'record'],
    queryFn: () => apiClient.getDentalRecord(patientId!),
    enabled: !!patientId,
  });

  const updateChartMutation = useMutation({
    mutationFn: (dentalChart: Record<string, Record<string, string>>) =>
      apiClient.updateDentalChart(patientId!, dentalChart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId, 'record'] });
    },
  });

  const addAttachmentMutation = useMutation({
    mutationFn: (payload: { filename: string; fileType: string; storageUrl: string }) =>
      apiClient.addRecordAttachment(patientId!, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patient', patientId, 'record'] }),
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('INTRAORAL');

  // Map backend dentalChart -> ToothChart prop
  const toothChartData = useMemo(() => {
    const chart: Record<string, Record<string, string>> = record?.dentalChart || {};
    const teeth: any[] = [];
    const toothNumbers = [
      // FDI: 18..11, 21..28, 48..41, 31..38
      ...Array.from({ length: 8 }, (_, i) => 18 - i),
      ...Array.from({ length: 8 }, (_, i) => 21 + i),
      ...Array.from({ length: 8 }, (_, i) => 48 - i),
      ...Array.from({ length: 8 }, (_, i) => 31 + i),
    ];
    const surfacePriority = ['CARIES', 'FILLING', 'CROWN', 'IMPLANT', 'EXTRACTION', 'MISSING', 'HEALTHY'];
    const statusOf = (surfaces: Record<string, string> | undefined) => {
      if (!surfaces) return 'HEALTHY';
      for (const s of surfacePriority) {
        if (Object.values(surfaces).some(v => v === s)) return s;
      }
      return 'HEALTHY';
    };
    toothNumbers.forEach((num) => {
      const key = `tooth_${num}`;
      const surfaces = chart[key];
      teeth.push({ toothNumber: num, status: statusOf(surfaces), surfaces: [] });
    });
    return { teeth };
  }, [record]);

  const handleToothUpdate = (toothNumber: number, status: any, notes?: string) => {
    const currentChart: Record<string, Record<string, string>> = { ...(record?.dentalChart || {}) };
    const key = `tooth_${toothNumber}`;
    // Simple rule: set all known surfaces to the same status for this tooth
    currentChart[key] = Object.fromEntries(DEFAULT_SURFACES.map(s => [s, status]));
    updateChartMutation.mutate(currentChart);
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const filename = selectedFile.name;
    // Simulated storage path until file upload backend exists
    const storageUrl = `/storage/images/${filename}`;
    addAttachmentMutation.mutate({ filename, fileType, storageUrl });
    setSelectedFile(null);
  };

  if (loadingProfile || loadingRecord) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Patient not found</h1>
        <p className="text-gray-600 mb-6">We couldn't load this patient's profile. Try again or go back to the list.</p>
        <Link to="/patients">
          <Button variant="outline">Back to My Patients</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{patient?.firstName} {patient?.lastName}</h1>
          <p className="text-gray-600">Patient Profile</p>
        </div>
        <Link to="/patients">
          <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2"/>Back to My Patients</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Patient info + Attachments */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><User className="h-5 w-5 mr-2"/>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Email</span><span className="font-medium">{patient?.email}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Phone</span><span className="font-medium">{patient?.phone || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">DOB</span><span className="font-medium">{patient?.dateOfBirth ? formatDate(patient.dateOfBirth) : '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Address</span><span className="font-medium text-right max-w-[60%]">{patient?.address || '—'}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><ImageIcon className="h-5 w-5 mr-2"/>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddAttachment} className="space-y-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="border rounded-md px-2 py-1"
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                  >
                    <option value="INTRAORAL">Intraoral</option>
                    <option value="PANTOMOGRAPHIC">Pantomographic</option>
                    <option value="XRAY">X-Ray</option>
                    <option value="PHOTO">Photo</option>
                    <option value="DOCUMENT">Document</option>
                  </select>

                  {/* Hidden native file input for accessibility */}
                  <input
                    id="patient-photo-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('patient-photo-input')?.click()}
                  >
                    Choose File
                  </Button>
                  <span className="text-sm text-gray-600 max-w-[240px] sm:max-w-[320px] truncate">
                    {selectedFile ? selectedFile.name : 'No file selected'}
                  </span>

                  <Button type="submit" disabled={!selectedFile}><Upload className="h-4 w-4 mr-2"/>Upload</Button>
                </div>
                <p className="text-xs text-gray-500 break-words">Uploads store metadata only for now.</p>
              </form>

              <div className="space-y-3">
                {(record?.attachments || []).length === 0 && (
                  <p className="text-gray-500 text-sm">No attachments yet.</p>
                )}
                {(record?.attachments || []).map((att: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center border rounded-md px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{att.filename}</p>
                      <p className="text-xs text-gray-500">{att.fileType} • {att.uploadDate ? formatDate(att.uploadDate) : ''}</p>
                    </div>
                    <a href={att.storageUrl} className="text-blue-600 text-sm hover:underline" target="_blank" rel="noreferrer">Open</a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Tooth Chart */}
        <div className="lg:col-span-2">
          <ToothChart dentalRecord={toothChartData} onToothUpdate={handleToothUpdate} />
        </div>
      </div>
    </div>
  );
};
