import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Download, FileText, Calendar, DollarSign } from 'lucide-react';
import { apiClient, queryKeys } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { PaymentModal } from '../../components/ui/PaymentModal';
import { formatCurrency, formatDate } from '../../lib/utils';

export const MyBilling: React.FC = () => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: queryKeys.myInvoices,
    queryFn: () => apiClient.getMyInvoices(),
  });

  const { data: treatmentPlans, isLoading: plansLoading } = useQuery({
    queryKey: queryKeys.myPlans,
    queryFn: () => apiClient.getMyTreatmentPlans(),
  });

  const paymentMutation = useMutation({
    mutationFn: ({ invoiceIds, paymentMethod }: { invoiceIds: string[]; paymentMethod: any }) =>
      apiClient.payInvoices(invoiceIds, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myInvoices });
      alert('Payment processed successfully!');
    },
    onError: (error: any) => {
      console.error('Payment error:', error);
    },
  });

  // Derive values from real data
  const currentInvoices = invoices ?? [];
  // Choose active plan if available, else most recent by createdAt
  const activePlan = (treatmentPlans ?? [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .find(p => p.status === 'ACTIVE') || (treatmentPlans && treatmentPlans[0]);

  if (invoicesLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalTreatmentCost = (activePlan?.procedures ?? [])
    .reduce((sum, p: any) => sum + Number(p?.costEstimate ?? 0), 0);
  const totalPaid = currentInvoices
    .filter((inv: any) => String(inv.status).toUpperCase() === 'PAID')
    .reduce((sum: number, inv: any) => sum + Number(inv.totalAmount ?? 0), 0);
  const totalOutstanding = Math.max(totalTreatmentCost - totalPaid, 0);
  const unpaidInvoices = currentInvoices.filter((inv: any) => String(inv.status).toUpperCase() !== 'PAID');

  const handlePayment = async (invoiceIds: string[], paymentMethod: any) => {
    await paymentMutation.mutateAsync({ invoiceIds, paymentMethod });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'UNPAID':
        return 'bg-orange-100 text-orange-800';
      case 'PARTIAL':
        return 'bg-amber-100 text-amber-800';
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
                  You have pending payments. {unpaidInvoices.length > 0 ? 'Click below to pay online.' : 'No unpaid invoices yet — payments are available when an invoice is issued.'}
                </p>
              </div>
              <Button 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  if (unpaidInvoices.length === 0) {
                    alert('There are no unpaid invoices to pay right now. Please check back once an invoice is issued.');
                    return;
                  }
                  setIsPaymentModalOpen(true);
                }}
                disabled={unpaidInvoices.length === 0}
                title={unpaidInvoices.length === 0 ? 'No unpaid invoices available' : undefined}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoices={currentInvoices}
        onPayment={handlePayment}
      />

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
              {(activePlan?.procedures ?? []).map((procedure) => (
                <div key={procedure.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{procedure.procedureName}</h4>
                    {(procedure.toothNumber || (procedure.toothNumbers && procedure.toothNumbers.length)) && (
                      <p className="text-sm text-gray-500">
                        {procedure.toothNumber
                          ? `Tooth ${procedure.toothNumber}`
                          : `Teeth ${(procedure.toothNumbers || []).join(', ')}`}
                      </p>
                    )}
                    {procedure.scheduledDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        {procedure.status === 'COMPLETED' ? 'Completed: ' : 'Scheduled: '}
                        {formatDate(procedure.scheduledDate)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProcedureStatusColor(procedure.status)}`}>
                      {procedure.status.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(Number(procedure.costEstimate ?? 0))}
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
              {currentInvoices.map((invoice: any) => (
                <div key={invoice.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{invoice.invoiceNumber || `INV-${(invoice.id || '').slice(-6).toUpperCase()}`}</h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(invoice.createdAt || invoice.issueDate)}
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
                    {(invoice.lineItems || []).map((item: any, idx: number) => {
                      const unit = Number(item.cost ?? 0);
                      const qty = Number(item.quantity ?? 1);
                      const total = unit * qty;
                      return (
                        <div key={item.id || idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.description} {qty > 1 && `(×${qty})`}
                          </span>
                          <span className="text-gray-900">{formatCurrency(total)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">{formatCurrency(Number(invoice.totalAmount ?? 0))}</span>
                    </div>
                    {/* Optional paid/due display can be added when backend exposes payments */}
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