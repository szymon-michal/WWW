import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Download, FileText, Calendar, DollarSign } from 'lucide-react';
import { apiClient, queryKeys } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../../lib/utils';

export const MyBilling: React.FC = () => {
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: queryKeys.myInvoices,
    queryFn: apiClient.getMyInvoices,
  });

  const { data: treatmentPlans, isLoading: plansLoading } = useQuery({
    queryKey: queryKeys.myPlans,
    queryFn: apiClient.getMyTreatmentPlans,
  });

  // Mock data for demo
  const mockInvoices = [
    {
      id: '1',
      invoiceNumber: 'INV-2025-001',
      totalAmount: 350.00,
      paidAmount: 350.00,
      status: 'PAID',
      dueDate: '2025-10-30T00:00:00Z',
      createdAt: '2025-10-15T10:00:00Z',
      lineItems: [
        {
          id: '1',
          description: 'Regular Cleaning',
          quantity: 1,
          unitPrice: 150.00,
          totalPrice: 150.00,
        },
        {
          id: '2',
          description: 'Fluoride Treatment',
          quantity: 1,
          unitPrice: 75.00,
          totalPrice: 75.00,
        },
        {
          id: '3',
          description: 'X-ray (Bitewing)',
          quantity: 2,
          unitPrice: 62.50,
          totalPrice: 125.00,
        },
      ],
    },
    {
      id: '2',
      invoiceNumber: 'INV-2025-002',
      totalAmount: 850.00,
      paidAmount: 500.00,
      status: 'SENT',
      dueDate: '2025-12-15T00:00:00Z',
      createdAt: '2025-11-01T09:00:00Z',
      lineItems: [
        {
          id: '4',
          description: 'Composite Filling',
          quantity: 2,
          unitPrice: 250.00,
          totalPrice: 500.00,
        },
        {
          id: '5',
          description: 'Root Canal Treatment',
          quantity: 1,
          unitPrice: 350.00,
          totalPrice: 350.00,
        },
      ],
    },
  ];

  const mockTreatmentPlan = {
    id: '1',
    title: 'Comprehensive Treatment Plan',
    totalCost: 2450.00,
    procedures: [
      {
        id: '1',
        procedureName: 'Root Canal - Tooth 24',
        toothNumber: 24,
        cost: 750.00,
        status: 'COMPLETED',
      },
      {
        id: '2',
        procedureName: 'Crown - Tooth 24',
        toothNumber: 24,
        cost: 900.00,
        status: 'PLANNED',
      },
      {
        id: '3',
        procedureName: 'Composite Filling - Tooth 11',
        toothNumber: 11,
        cost: 300.00,
        status: 'IN_PROGRESS',
      },
      {
        id: '4',
        procedureName: 'Professional Cleaning',
        cost: 150.00,
        status: 'COMPLETED',
      },
      {
        id: '5',
        procedureName: 'Whitening Treatment',
        cost: 350.00,
        status: 'PLANNED',
      },
    ],
  };

  if (invoicesLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentInvoices = invoices || mockInvoices;
  const totalPaid = currentInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalOutstanding = currentInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
  const totalTreatmentCost = mockTreatmentPlan.totalCost;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProcedureStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Treatment & Billing</h1>
        <p className="mt-2 text-gray-600">
          View your treatment plan, invoices, and payment history.
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalOutstanding)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Treatment</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalTreatmentCost)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pay Outstanding Balance */}
      {totalOutstanding > 0 && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-orange-900">
                  Outstanding Balance: {formatCurrency(totalOutstanding)}
                </h3>
                <p className="text-orange-700 mt-1">
                  You have pending payments. Click below to pay online.
                </p>
              </div>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Treatment Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-purple-500 mr-2" />
                Treatment Plan
              </div>
              <span className="text-sm text-gray-500">{formatCurrency(totalTreatmentCost)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTreatmentPlan.procedures.map((procedure) => (
                <div key={procedure.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{procedure.procedureName}</h4>
                    {procedure.toothNumber && (
                      <p className="text-sm text-gray-500">Tooth {procedure.toothNumber}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProcedureStatusColor(procedure.status)}`}>
                      {procedure.status.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(procedure.cost)}
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-purple-600">
                    {formatCurrency(totalTreatmentCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Paid</span>
                  <span>{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Remaining</span>
                  <span className="text-orange-600">
                    {formatCurrency(totalTreatmentCost - totalPaid)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 text-green-500 mr-2" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentInvoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    {invoice.lineItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.description} {item.quantity > 1 && `(×${item.quantity})`}
                        </span>
                        <span className="text-gray-900">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                    {invoice.paidAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Paid</span>
                        <span>-{formatCurrency(invoice.paidAmount)}</span>
                      </div>
                    )}
                    {invoice.totalAmount > invoice.paidAmount && (
                      <div className="flex justify-between text-sm font-medium text-orange-600">
                        <span>Due</span>
                        <span>{formatCurrency(invoice.totalAmount - invoice.paidAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {currentInvoices.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Invoices Yet
                  </h3>
                  <p className="text-gray-500">
                    Your invoices will appear here after treatments.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};