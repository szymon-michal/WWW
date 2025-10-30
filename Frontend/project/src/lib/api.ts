import { QueryClient } from '@tanstack/react-query';
import {
  User,
  PatientProfile,
  DentalRecord,
  TreatmentPlan,
  Invoice,
  Appointment,
  ClinicalNote,
  Attachment,
  LoginRequest,
  LoginResponse,
  PatientRegistrationRequest,
  DentistRegistrationRequest,
  ApiResponse,
  ApiError,
  PlannedProcedure
} from '../types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json; charset=utf-8',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          code: errorData.code || response.status.toString(),
          details: errorData,
        };
        throw error;
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error
        throw {
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        } as ApiError;
      }
      throw error;
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async registerPatient(data: PatientRegistrationRequest): Promise<User> {
    return this.request<User>('/auth/register/patient', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerDentist(data: DentistRegistrationRequest): Promise<User> {
    return this.request<User>('/auth/register/dentist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Patient Management (Dentist endpoints)
  async getAllPatients(): Promise<PatientProfile[]> {
    return this.request<PatientProfile[]>('/api/patients');
  }

  async getPatientById(patientId: string): Promise<PatientProfile> {
    return this.request<PatientProfile>(`/api/patients/${patientId}`);
  }

  async updatePatient(patientId: string, data: Partial<PatientProfile>): Promise<PatientProfile> {
    return this.request<PatientProfile>(`/api/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Treatment Planning
  async getPatientTreatmentPlans(patientId: string): Promise<TreatmentPlan[]> {
    return this.request<TreatmentPlan[]>(`/api/patients/${patientId}/plans`);
  }

  async createTreatmentPlan(patientId: string, plan: Omit<TreatmentPlan, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>): Promise<TreatmentPlan> {
    return this.request<TreatmentPlan>(`/api/patients/${patientId}/plans`, {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  async addProcedureToPlan(planId: string, procedure: Omit<PlannedProcedure, 'id' | 'planId'>): Promise<PlannedProcedure> {
    return this.request<PlannedProcedure>(`/api/plans/${planId}/procedures`, {
      method: 'POST',
      body: JSON.stringify(procedure),
    });
  }

  async updateProcedure(procedureId: string, data: Partial<PlannedProcedure>): Promise<PlannedProcedure> {
    return this.request<PlannedProcedure>(`/api/procedures/${procedureId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Billing
  async getPatientInvoices(patientId: string): Promise<Invoice[]> {
    return this.request<Invoice[]>(`/api/patients/${patientId}/invoices`);
  }

  async generateInvoice(patientId: string, invoiceData: Omit<Invoice, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    return this.request<Invoice>(`/api/patients/${patientId}/invoices`, {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  }

  // Patient Portal
  async getMyRecord(): Promise<DentalRecord> {
    return this.request<DentalRecord>('/api/my/record');
  }

  async getMyProfile(): Promise<PatientProfile> {
    return this.request<PatientProfile>('/api/my/profile');
  }

  async getMyTreatmentPlans(): Promise<TreatmentPlan[]> {
    return this.request<TreatmentPlan[]>('/api/my/plans');
  }

  async getMyInvoices(): Promise<Invoice[]> {
    return this.request<Invoice[]>('/api/my/invoices');
  }

  async getMyAppointments(): Promise<Appointment[]> {
    return this.request<Appointment[]>('/api/my/appointments');
  }
}

export const apiClient = new ApiClient();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys
export const queryKeys = {
  // Auth
  currentUser: ['user', 'current'] as const,
  
  // Patients (Dentist view)
  patients: ['patients'] as const,
  patient: (id: string) => ['patients', id] as const,
  patientTreatmentPlans: (id: string) => ['patients', id, 'plans'] as const,
  patientInvoices: (id: string) => ['patients', id, 'invoices'] as const,
  
  // Patient Portal
  myProfile: ['my', 'profile'] as const,
  myRecord: ['my', 'record'] as const,
  myPlans: ['my', 'plans'] as const,
  myInvoices: ['my', 'invoices'] as const,
  myAppointments: ['my', 'appointments'] as const,
} as const;