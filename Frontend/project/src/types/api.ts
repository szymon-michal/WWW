// API Types based on OpenAPI schema

export interface User {
  id: string;
  email: string;
  role: 'DENTIST' | 'STAFF' | 'PATIENT' | 'ADMIN';
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  nationalId?: string;
  address?: string;
  emergencyContact?: string;
  insuranceNumber?: string;
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DentalRecord {
  id: string;
  patientId: string;
  teeth: ToothRecord[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ToothRecord {
  toothNumber: number; // 1-32 for adult teeth
  status: 'HEALTHY' | 'CARIES' | 'FILLING' | 'CROWN' | 'IMPLANT' | 'EXTRACTION' | 'MISSING';
  surfaces: ToothSurface[];
  notes?: string;
  lastUpdated: string;
}

export interface ToothSurface {
  surface: 'OCCLUSAL' | 'MESIAL' | 'DISTAL' | 'BUCCAL' | 'LINGUAL' | 'INCISAL';
  condition: 'HEALTHY' | 'CARIES' | 'RESTORED' | 'FRACTURED';
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  totalCost: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  procedures: PlannedProcedure[];
  createdAt: string;
  updatedAt: string;
}

export interface PlannedProcedure {
  id: string;
  planId: string;
  procedureCode: string;
  procedureName: string;
  toothNumber?: number;
  cost: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  lineItems: LineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  appointmentDate: string;
  duration: number;
  type: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  createdAt: string;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  authorId: string;
  content: string;
  visitDate: string;
  procedures?: string[];
  createdAt: string;
}

export interface Attachment {
  id: string;
  patientId: string;
  filename: string;
  fileType: 'XRAY' | 'PHOTO' | 'DOCUMENT';
  fileSize: number;
  uploadDate: string;
  description?: string;
}

// Request/Response types
export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface PatientRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth: string;
  nationalId?: string;

  // NEW: login będzie wypełniany automatycznie (email)
  username?: string;
}

export interface DentistRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  licenseNumber: string;
  specialization?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}