package com.dentistplus.dto;

import java.util.List;

public class PaymentRequest {
    private List<String> invoiceIds;
    private PaymentMethod paymentMethod;

    public static class PaymentMethod {
        private String type; // CARD, CASH, etc.
        private CardDetails cardDetails;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public CardDetails getCardDetails() {
            return cardDetails;
        }

        public void setCardDetails(CardDetails cardDetails) {
            this.cardDetails = cardDetails;
        }
    }

    public static class CardDetails {
        private String cardNumber;
        private String cardholderName;
        private String expiryMonth;
        private String expiryYear;
        private String cvv;

        public String getCardNumber() {
            return cardNumber;
        }

        public void setCardNumber(String cardNumber) {
            this.cardNumber = cardNumber;
        }

        public String getCardholderName() {
            return cardholderName;
        }

        public void setCardholderName(String cardholderName) {
            this.cardholderName = cardholderName;
        }

        public String getExpiryMonth() {
            return expiryMonth;
        }

        public void setExpiryMonth(String expiryMonth) {
            this.expiryMonth = expiryMonth;
        }

        public String getExpiryYear() {
            return expiryYear;
        }

        public void setExpiryYear(String expiryYear) {
            this.expiryYear = expiryYear;
        }

        public String getCvv() {
            return cvv;
        }

        public void setCvv(String cvv) {
            this.cvv = cvv;
        }
    }

    public List<String> getInvoiceIds() {
        return invoiceIds;
    }

    public void setInvoiceIds(List<String> invoiceIds) {
        this.invoiceIds = invoiceIds;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
