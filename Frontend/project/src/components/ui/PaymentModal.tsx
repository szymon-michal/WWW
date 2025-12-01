import React, { useMemo, useState } from 'react';
import { X, CreditCard, Check } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { formatCurrency } from '../../lib/utils';

interface Invoice {
  id: string;
  invoiceNumber?: string;
  totalAmount: number;
  status: string;
  issueDate?: string;
  lineItems?: Array<{ description: string; cost: number; quantity: number }>;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onPayment: (selectedInvoiceIds: string[], paymentMethod: any) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onPayment,
}) => {
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const unpaidInvoices = invoices.filter(inv => inv.status !== 'PAID');
  
  const totalSelected = unpaidInvoices
    .filter(inv => selectedInvoiceIds.includes(inv.id))
    .reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

  const toggleInvoice = (invoiceId: string) => {
    setSelectedInvoiceIds(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  // ----- Validation helpers -----
  const luhnCheck = (num: string) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const numeric = (s: string) => s.replace(/\D/g, '');

  const cardDigits = useMemo(() => numeric(cardNumber), [cardNumber]);
  const yearNormalized = useMemo(() => {
    const y = numeric(expiryYear);
    if (y.length === 2) return Number(`20${y}`);
    if (y.length === 4) return Number(y);
    return NaN;
  }, [expiryYear]);

  const monthNumber = useMemo(() => {
    const m = Number(numeric(expiryMonth));
    return m;
  }, [expiryMonth]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1..12

  const cardNumberError = useMemo(() => {
    if (!cardDigits) return 'Card number is required';
    if (cardDigits.length < 13 || cardDigits.length > 19) return 'Card number must be 13-19 digits';
    if (!luhnCheck(cardDigits)) return 'Card number is invalid';
    return '';
  }, [cardDigits]);

  const nameError = useMemo(() => {
    const trimmed = cardholderName.trim();
    if (!trimmed) return 'Cardholder name is required';
    if (trimmed.length < 3) return 'Name is too short';
    // Allow letters, spaces, hyphens, apostrophes
    if (!/^[A-Za-zÀ-ÿ'\- ]+$/.test(trimmed)) return 'Name contains invalid characters';
    return '';
  }, [cardholderName]);

  const expiryError = useMemo(() => {
    if (!monthNumber || !yearNormalized) return 'Expiry is required';
    if (monthNumber < 1 || monthNumber > 12) return 'Month must be 01-12';
    if (yearNormalized < currentYear || yearNormalized > currentYear + 25) return 'Invalid expiry year';
    if (yearNormalized === currentYear && monthNumber < currentMonth) return 'Card is expired';
    return '';
  }, [monthNumber, yearNormalized, currentMonth, currentYear]);

  const cvvError = useMemo(() => {
    const digits = numeric(cvv);
    if (!digits) return 'CVV is required';
    if (digits.length < 3 || digits.length > 4) return 'CVV must be 3 or 4 digits';
    return '';
  }, [cvv]);

  const formValid = useMemo(() => {
    return !cardNumberError && !nameError && !expiryError && !cvvError && selectedInvoiceIds.length > 0;
  }, [cardNumberError, nameError, expiryError, cvvError, selectedInvoiceIds.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;

    setIsProcessing(true);
    try {
      const paymentMethod = {
        type: 'CARD',
        cardDetails: {
          cardNumber: cardDigits,
          cardholderName,
          expiryMonth,
          expiryYear,
          cvv,
        },
      };

      await onPayment(selectedInvoiceIds, paymentMethod);
      
      // Reset form
      setSelectedInvoiceIds([]);
      setCardNumber('');
      setCardholderName('');
      setExpiryMonth('');
      setExpiryYear('');
      setCvv('');
      
      onClose();
    } catch (error: any) {
      alert(error?.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 16);
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
    return formatted;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Pay Invoices</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Select Invoices */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Invoices to Pay</h3>
            {unpaidInvoices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No unpaid invoices</p>
            ) : (
              <div className="space-y-2">
                {unpaidInvoices.map((invoice) => (
                  <label
                    key={invoice.id}
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedInvoiceIds.includes(invoice.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedInvoiceIds.includes(invoice.id)}
                        onChange={() => toggleInvoice(invoice.id)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <div>
                        <p className="font-medium">
                          {invoice.invoiceNumber || `INV-${invoice.id.slice(-6).toUpperCase()}`}
                        </p>
                        {invoice.lineItems && invoice.lineItems.length > 0 && (
                          <p className="text-sm text-gray-500">
                            {invoice.lineItems[0].description}
                            {invoice.lineItems.length > 1 && ` +${invoice.lineItems.length - 1} more`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{formatCurrency(Number(invoice.totalAmount))}</span>
                      {selectedInvoiceIds.includes(invoice.id) && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          {selectedInvoiceIds.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Card Payment
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    aria-invalid={!!cardNumberError}
                    aria-describedby="cardNumber-error"
                    className={cardNumberError ? 'border-red-500 focus:ring-red-500' : ''}
                    required
                  />
                  {cardNumberError && (
                    <p id="cardNumber-error" className="mt-1 text-xs text-red-600">{cardNumberError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    aria-invalid={!!nameError}
                    aria-describedby="name-error"
                    className={nameError ? 'border-red-500 focus:ring-red-500' : ''}
                    required
                  />
                  {nameError && (
                    <p id="name-error" className="mt-1 text-xs text-red-600">{nameError}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <Input
                      type="text"
                      placeholder="MM"
                      value={expiryMonth}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                        setExpiryMonth(val);
                      }}
                      maxLength={2}
                      aria-invalid={!!expiryError}
                      aria-describedby="expiry-error"
                      className={expiryError ? 'border-red-500 focus:ring-red-500' : ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <Input
                      type="text"
                      placeholder="YY"
                      value={expiryYear}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                        setExpiryYear(val);
                      }}
                      maxLength={2}
                      aria-invalid={!!expiryError}
                      aria-describedby="expiry-error"
                      className={expiryError ? 'border-red-500 focus:ring-red-500' : ''}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 3);
                        setCvv(val);
                      }}
                      maxLength={3}
                      aria-invalid={!!cvvError}
                      aria-describedby="cvv-error"
                      className={cvvError ? 'border-red-500 focus:ring-red-500' : ''}
                      required
                    />
                  </div>
                </div>
                {(expiryError || cvvError) && (
                  <div className="mt-1">
                    {expiryError && <p id="expiry-error" className="text-xs text-red-600">{expiryError}</p>}
                    {cvvError && <p id="cvv-error" className="text-xs text-red-600">{cvvError}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total & Actions */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Total to Pay:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalSelected)}
              </span>
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={isProcessing || !formValid}
              >
                {isProcessing ? 'Processing...' : `Pay ${formatCurrency(totalSelected)}`}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
