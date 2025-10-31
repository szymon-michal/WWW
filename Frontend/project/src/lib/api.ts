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

// In dev, prefer relative URLs so Vite proxy handles CORS; in prod, use configured base URL
const BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? '');

class ApiClient {
  private token: string | null = null;
  private userId: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    this.userId = localStorage.getItem('user_id');
  }

  setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  setUserId(userId: string | null) {
    this.userId = userId;
    if (userId) {
      localStorage.setItem('user_id', userId);
    } else {
      localStorage.removeItem('user_id');
    }
  }

private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  // 1) bazowe nagłówki
  const base = new Headers({ 'Content-Type': 'application/json; charset=utf-8' });

  // 2) dolej ewentualne nagłówki z options (niezależnie od formatu)
  if (options.headers) {
    new Headers(options.headers as any).forEach((v, k) => base.set(k, v));
  }

  // 3) ustaw Authorization jeśli mamy token
  if (this.token) {
    base.set('Authorization', `Bearer ${this.token}`);
  }

  // 3b) dołącz X-User-ID dla endpointów wymagających identyfikatora użytkownika
  if (this.userId) {
    base.set('X-User-ID', this.userId);
  }

  // 4) zbuduj config – podmień headers na `base`
 const config: RequestInit = { credentials: 'include', ...options, headers: base };


  console.log('→', config.method ?? 'GET', url, config.body ?? '');

  try {
    const response = await fetch(url, config);
    const status = response.status;
    const ct = response.headers.get('content-type') ?? '';
    const raw = await response.text();

    if (!response.ok) {
      console.log('←', status, raw);
      let errorJson: any = {};
      try { errorJson = raw ? JSON.parse(raw) : {}; } catch {}
      throw { message: errorJson.message || `HTTP ${status}`, code: String(status), details: errorJson };
    }

    console.log('←', status, ct, raw ? `(len=${raw.length})` : '(empty body)');

    if (!raw) return {} as T;
    if (ct.includes('application/json')) {
      try { return JSON.parse(raw) as T; } catch {}
    }
    return {} as T;
  } catch (err) {
    if (err instanceof TypeError) {
      throw { message: 'Network error. Please check your connection.', code: 'NETWORK_ERROR' };
    }
    throw err;
  }
}



  // Authentication
async login(credentials: LoginRequest): Promise<LoginResponse> {
  const payload = { username: credentials.email, password: credentials.password };
  const resp = await this.request<any>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',     // ← ważne przy sesji w cookie
  });
  // Backend zwraca obiekt User – zapisz ID do nagłówka X-User-ID
  if (resp && resp.id) {
    this.setUserId(resp.id);
  } else if (resp?.user?.id) {
    this.setUserId(resp.user.id);
  }
  return resp as LoginResponse;



  // return this.request<LoginResponse>('/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' }, // jeśli nie ustawiasz globalnie
  //   body: JSON.stringify(payload),
  //   // credentials: 'include', // włącz, jeśli backend ustawia cookie HttpOnly
  // });
}

  async registerPatient(data: PatientRegistrationRequest): Promise<User> {
     const payload = { ...data, username: data.email }; // <- kluczowa linia
  return this.request<User>('/auth/register/patient', {
    method: 'POST',
    body: JSON.stringify(payload),
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
  return this.request<PatientProfile>('/api/my/profile', {
    credentials: 'include',
  });
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