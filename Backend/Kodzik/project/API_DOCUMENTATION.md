# Dentist+ Backend API Documentation

## Overview
This document describes the REST API endpoints for the Dentist+ dental practice management system.

## Authentication & Authorization
- All endpoints (except public ones) require an `X-User-ID` header containing the user ID
- Authorization is handled manually by checking user roles
- No JWT tokens are used - simple user ID validation

## Base URL
```
http://localhost:8080
```

## API Documentation
Interactive API documentation is available at:
```
http://localhost:8080/swagger-ui.html
```

---

## Authentication Endpoints

### POST /auth/login
**Description**: Authenticate user with username and password  
**Access**: Public  
**Request Body**:
```json
{
  "username": "john.doe",
  "password": "password123"
}
```
**Success Response**:
```json
{
  "id": "user123",
  "username": "john.doe",
  "email": "john.doe@email.com",
  "roles": ["ROLE_PATIENT"],
  "createdAt": "2024-01-15 10:30:00",
  "updatedAt": "2024-01-15 10:30:00"
}
```

### POST /auth/register/patient
**Description**: Public endpoint for patient self-registration  
**Access**: Public  
**Request Body**:
```json
{
  "username": "jane.doe",
  "password": "password123",
  "email": "jane.doe@email.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15",
  "contactPhone": "555-0123",
  "address": "123 Main St, City, State 12345"
}
```
**Success Response**: User object (same as login)

### POST /auth/register/dentist
**Description**: Admin-only endpoint to create dentist accounts  
**Access**: ROLE_ADMIN  
**Headers**: `X-User-ID: {adminUserId}`  
**Request Body**:
```json
{
  "username": "dr.smith",
  "password": "password123",
  "email": "dr.smith@dentistplus.com"
}
```
**Success Response**: User object with ROLE_DENTIST

---

## Patient Management Endpoints (Dentist-Facing)

### GET /api/patients
**Description**: Search/list all patients  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Query Parameters**: 
- `search` (optional): Search query for patient name
**Success Response**:
```json
[
  {
    "id": "patient123",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1985-03-15",
    "contactPhone": "555-0101",
    "address": "123 Main St, Anytown, USA 12345",
    "medicalHistorySummary": "No significant medical history",
    "insuranceDetails": "DeltaDental - Policy #DD123456789",
    "createdAt": "2024-01-15 10:30:00",
    "updatedAt": "2024-01-15 10:30:00"
  }
]
```

### GET /api/patients/{patientId}
**Description**: Get full profile of a single patient  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Success Response**: Single PatientProfile object

### PUT /api/patients/{patientId}
**Description**: Update patient profile  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Request Body**: PatientProfile object with updated fields
**Success Response**: Updated PatientProfile object

---

## Dental Health Record Endpoints

### GET /api/patients/{patientId}/record
**Description**: Get the full dental record  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Success Response**:
```json
{
  "id": "record123",
  "dentalChart": {
    "tooth_18": {
      "occlusal": "FILLING",
      "buccal": "HEALTHY",
      "lingual": "HEALTHY",
      "mesial": "HEALTHY",
      "distal": "HEALTHY"
    },
    "tooth_17": {
      "occlusal": "CARIES",
      "buccal": "HEALTHY",
      "lingual": "PLAQUE"
    }
  },
  "attachments": [
    {
      "filename": "panto_2023-10-28.jpg",
      "fileType": "PANTOMOGRAPHIC",
      "uploadDate": "2024-01-15 10:30:00",
      "storageUrl": "/storage/images/panto_patient123_2023.jpg"
    }
  ],
  "generalNotes": [
    {
      "note": "Patient shows good oral hygiene",
      "timestamp": "2024-01-15 10:30:00",
      "dentistName": "dr.smith"
    }
  ]
}
```

### PUT /api/patients/{patientId}/record/chart
**Description**: Update the dentalChart object  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Request Body**:
```json
{
  "tooth_18": {
    "occlusal": "FILLING",
    "buccal": "HEALTHY"
  },
  "tooth_17": {
    "occlusal": "CARIES"
  }
}
```
**Success Response**: Updated DentalRecord object

### POST /api/patients/{patientId}/record/attachments
**Description**: Add attachment metadata  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Request Body**:
```json
{
  "filename": "xray_tooth14.jpg",
  "fileType": "XRAY",
  "storageUrl": "/storage/images/xray_patient123_tooth14.jpg"
}
```
**Success Response**: Updated DentalRecord object

### POST /api/patients/{patientId}/record/notes
**Description**: Add a new clinical note  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Request Body**:
```json
{
  "note": "Patient completed root canal treatment successfully"
}
```
**Success Response**: Updated DentalRecord object

---

## Treatment & Billing Endpoints

### GET /api/patients/{patientId}/plans
**Description**: Get all treatment plans for a patient  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Success Response**:
```json
[
  {
    "id": "plan123",
    "planName": "2024 Treatment Plan",
    "description": "Comprehensive treatment plan",
    "procedures": [
      {
        "id": "proc123",
        "procedureName": "Composite Filling",
        "procedureCode": "D2391",
        "toothNumbers": ["17"],
        "costEstimate": 150.00,
        "status": "PLANNED",
        "createdAt": "2024-01-15 10:30:00"
      }
    ],
    "createdAt": "2024-01-15 10:30:00"
  }
]
```

### POST /api/patients/{patientId}/plans
**Description**: Create a new treatment plan  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Request Body**:
```json
{
  "planName": "Emergency Treatment Plan",
  "description": "Urgent dental care needed"
}
```
**Success Response**: Created TreatmentPlan object

### POST /api/plans/{planId}/procedures
**Description**: Add a procedure to a treatment plan  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Request Body**:
```json
{
  "procedureName": "Root Canal",
  "procedureCode": "D3310",
  "toothNumbers": ["14"],
  "costEstimate": 950.00,
  "notes": "Urgent treatment required"
}
```
**Success Response**: Updated TreatmentPlan object

### PUT /api/procedures/{procedureId}
**Description**: Update procedure status or cost  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Request Body**:
```json
{
  "status": "COMPLETED",
  "costEstimate": 975.00,
  "notes": "Procedure completed successfully"
}
```
**Success Response**: Updated TreatmentPlan object

### POST /api/patients/{patientId}/invoices
**Description**: Generate an invoice from completed procedures  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Success Response**:
```json
{
  "id": "invoice123",
  "issueDate": "2024-01-15",
  "lineItems": [
    {
      "description": "Composite Filling",
      "cost": 150.00,
      "quantity": 1,
      "procedureCode": "D2391"
    }
  ],
  "totalAmount": 150.00,
  "status": "UNPAID",
  "createdAt": "2024-01-15 10:30:00"
}
```

### GET /api/patients/{patientId}/invoices
**Description**: Get all invoices for a patient  
**Access**: ROLE_DENTIST  
**Headers**: `X-User-ID: {dentistUserId}`  
**Success Response**: Array of Invoice objects

---

## Patient Portal Endpoints (Patient-Facing)

### GET /api/my/profile
**Description**: Get patient's own profile  
**Access**: ROLE_PATIENT  
**Headers**: `X-User-ID: {patientUserId}`  
**Success Response**: PatientProfile object

### GET /api/my/record
**Description**: Get patient's own dental record  
**Access**: ROLE_PATIENT  
**Headers**: `X-User-ID: {patientUserId}`  
**Success Response**: DentalRecord object

### GET /api/my/plans
**Description**: Get patient's own treatment plans  
**Access**: ROLE_PATIENT  
**Headers**: `X-User-ID: {patientUserId}`  
**Success Response**: Array of TreatmentPlan objects

### GET /api/my/appointments
**Description**: Get patient's own appointments  
**Access**: ROLE_PATIENT  
**Headers**: `X-User-ID: {patientUserId}`  
**Success Response**:
```json
[
  {
    "id": "apt123",
    "appointmentDate": "2024-02-15 14:30:00",
    "appointmentType": "Regular Checkup",
    "status": "SCHEDULED",
    "notes": "Routine examination",
    "durationMinutes": 60,
    "dentist": {
      "id": "dentist123",
      "username": "dr.smith",
      "email": "dr.smith@dentistplus.com"
    }
  }
]
```

### GET /api/my/invoices
**Description**: Get patient's billing history  
**Access**: ROLE_PATIENT  
**Headers**: `X-User-ID: {patientUserId}`  
**Success Response**: Array of Invoice objects

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "timestamp": "2024-01-15 10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2024-01-15 10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Insufficient permissions. Required role: ROLE_DENTIST"
}
```

### 404 Not Found
```json
{
  "timestamp": "2024-01-15 10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Patient not found with id: patient123"
}
```

### 422 Validation Error
```json
{
  "timestamp": "2024-01-15 10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Input validation failed",
  "validationErrors": {
    "username": "Username is required",
    "email": "Email should be valid"
  }
}
```