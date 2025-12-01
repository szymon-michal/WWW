import React, { useState } from 'react';
import { ToothRecord, ToothSurface } from '../../types/api';
import { TOOTH_STATUS_COLORS, TOOTH_STATUS_LABELS } from '../../lib/utils';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ToothChartProps {
  dentalRecord?: {
    teeth: ToothRecord[];
  };
  onToothUpdate?: (toothNumber: number, status: ToothRecord['status'], notes?: string) => void;
  readOnly?: boolean;
}

export const ToothChart: React.FC<ToothChartProps> = ({
  dentalRecord,
  onToothUpdate,
  readOnly = false,
}) => {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getToothRecord = (toothNumber: number): ToothRecord | undefined => {
    return dentalRecord?.teeth.find(tooth => tooth.toothNumber === toothNumber);
  };

  const handleToothClick = (toothNumber: number) => {
    if (readOnly) return;
    setSelectedTooth(toothNumber);
    setIsModalOpen(true);
  };

  const ToothComponent: React.FC<{ toothNumber: number; isUpper: boolean }> = ({ 
    toothNumber, 
    isUpper 
  }) => {
    const toothRecord = getToothRecord(toothNumber);
    const status = toothRecord?.status || 'HEALTHY';
    const color = TOOTH_STATUS_COLORS[status];

    return (
      <div
        className={`
          relative w-8 h-10 mx-1 rounded-lg border-2 border-gray-300 cursor-pointer
          transition-all duration-200 hover:scale-110 hover:shadow-lg
          ${!readOnly ? 'cursor-pointer' : 'cursor-default'}
          ${isUpper ? 'mb-2' : 'mt-2'}
        `}
        style={{ backgroundColor: color }}
        onClick={() => handleToothClick(toothNumber)}
        title={`Tooth ${toothNumber} - ${TOOTH_STATUS_LABELS[status]}`}
      >
        <div className={`
          absolute left-1/2 transform -translate-x-1/2 text-xs font-bold text-white
          ${isUpper ? 'bottom-0.5' : 'top-0.5'}
        `}>
          {toothNumber}
        </div>
      </div>
    );
  };

  // Upper teeth (18-11, 21-28)
  const upperRight = Array.from({ length: 8 }, (_, i) => 18 - i); // 18, 17, 16, 15, 14, 13, 12, 11
  const upperLeft = Array.from({ length: 8 }, (_, i) => 21 + i);   // 21, 22, 23, 24, 25, 26, 27, 28

  // Lower teeth (48-41, 31-38)
  const lowerRight = Array.from({ length: 8 }, (_, i) => 48 - i); // 48, 47, 46, 45, 44, 43, 42, 41
  const lowerLeft = Array.from({ length: 8 }, (_, i) => 31 + i);   // 31, 32, 33, 34, 35, 36, 37, 38

  const ToothModal: React.FC = () => {
    const [newStatus, setNewStatus] = useState<ToothRecord['status']>('HEALTHY');
    const [notes, setNotes] = useState('');

    const toothRecord = selectedTooth ? getToothRecord(selectedTooth) : null;

    React.useEffect(() => {
      if (toothRecord) {
        setNewStatus(toothRecord.status);
        setNotes(toothRecord.notes || '');
      } else {
        setNewStatus('HEALTHY');
        setNotes('');
      }
    }, [toothRecord]);

    const handleSave = () => {
      if (selectedTooth && onToothUpdate) {
        onToothUpdate(selectedTooth, newStatus, notes);
      }
      setIsModalOpen(false);
    };

    return (
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Tooth ${selectedTooth} Details`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ToothRecord['status'])}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {Object.entries(TOOTH_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Additional notes about this tooth..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dental Chart - FDI Notation</h3>
          {!readOnly && (
            <p className="text-sm text-gray-600">Click on any tooth to view or update its status</p>
          )}
        </div>

        {/* Dental Chart */}
        <div className="flex flex-col items-center space-y-4">
          {/* Upper teeth */}
          <div className="flex items-center">
            <div className="flex">
              {upperRight.map(toothNumber => (
                <ToothComponent key={toothNumber} toothNumber={toothNumber} isUpper={true} />
              ))}
            </div>
            <div className="w-4" /> {/* Gap between upper right and left */}
            <div className="flex">
              {upperLeft.map(toothNumber => (
                <ToothComponent key={toothNumber} toothNumber={toothNumber} isUpper={true} />
              ))}
            </div>
          </div>

          {/* Divider line */}
          <div className="w-full border-t border-gray-300"></div>

          {/* Lower teeth */}
          <div className="flex items-center">
            <div className="flex">
              {lowerRight.map(toothNumber => (
                <ToothComponent key={toothNumber} toothNumber={toothNumber} isUpper={false} />
              ))}
            </div>
            <div className="w-4" /> {/* Gap between lower right and left */}
            <div className="flex">
              {lowerLeft.map(toothNumber => (
                <ToothComponent key={toothNumber} toothNumber={toothNumber} isUpper={false} />
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(TOOTH_STATUS_LABELS).map(([status, label]) => (
              <div key={status} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: TOOTH_STATUS_COLORS[status as keyof typeof TOOTH_STATUS_COLORS] }}
                />
                <span className="text-xs text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTooth && <ToothModal />}
    </Card>
  );
};