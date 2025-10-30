# Dentist+ Database Schema Documentation

## Overview
This document describes the MongoDB database schema for the Dentist+ dental practice management system.

## Database: `dentistplus`

---

## Collections

### 1. users
**Purpose**: Stores user authentication and basic profile information

| Field | Type | Description | Required | Unique |
|-------|------|-------------|----------|--------|
| _id | ObjectId | MongoDB primary key | Yes | Yes |
| username | String | User login name | Yes | Yes |
| password | String | User password (plaintext) | Yes | No |
| email | String | User email address | Yes | Yes |
| roles | Array[String] | User roles (ROLE_ADMIN, ROLE_DENTIST, ROLE_PATIENT) | Yes | No |
| createdAt | DateTime | Account creation timestamp | Yes | No |
| updatedAt | DateTime | Last modification timestamp | Yes | No |

**Sample Document**:
```json
{
  "_id": ObjectId("65a1234567890abcdef12345"),
  "username": "john.doe",
  "password": "password123",
  "email": "john.doe@email.com",
  "roles": ["ROLE_PATIENT"],
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

**Indexes**:
- `username` (unique)
- `email` (unique)

---

### 2. patient_profiles
**Purpose**: Extended profile information for patients

| Field | Type | Description | Required | Unique |
|-------|------|-------------|----------|--------|
| _id | ObjectId | MongoDB primary key | Yes | Yes |
| user | DBRef | Reference to users collection | Yes | No |
| firstName | String | Patient's first name | Yes | No |
| lastName | String | Patient's last name | Yes | No |
| dateOfBirth | Date | Patient's birth date | No | No |
| contactPhone | String | Patient's phone number | No | No |
| address | String | Patient's address | No | No |
| medicalHistorySummary | String | Summary of medical history | No | No |
| insuranceDetails | String | Insurance information | No | No |
| createdAt | DateTime | Profile creation timestamp | Yes | No |
| updatedAt | DateTime | Last modification timestamp | Yes | No |

**Sample Document**:
```json
{
  "_id": ObjectId("65a1234567890abcdef12346"),
  "user": DBRef("users", ObjectId("65a1234567890abcdef12345")),
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": ISODate("1985-03-15T00:00:00.000Z"),
  "contactPhone": "555-0101",
  "address": "123 Main St, Anytown, USA 12345",
  "medicalHistorySummary": "No significant medical history",
  "insuranceDetails": "DeltaDental - Policy #DD123456789",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

---

### 3. dental_records
**Purpose**: Stores comprehensive dental health information for patients

| Field | Type | Description | Required | Unique |
|-------|------|-------------|----------|--------|
| _id | ObjectId | MongoDB primary key | Yes | Yes |
| patientProfile | DBRef | Reference to patient_profiles collection | Yes | No |
| dentalChart | Object | Map of teeth and their surface conditions | No | No |
| attachments | Array[Object] | Medical image and file metadata | No | No |
| generalNotes | Array[Object] | Clinical notes from dentists | No | No |
| createdAt | DateTime | Record creation timestamp | Yes | No |
| updatedAt | DateTime | Last modification timestamp | Yes | No |

**dentalChart Structure**:
```json
{
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
}
```

**Attachment Object Structure**:
```json
{
  "filename": "panto_2023-10-28.jpg",
  "fileType": "PANTOMOGRAPHIC",
  "uploadDate": ISODate("2024-01-15T10:30:00.000Z"),
  "storageUrl": "/storage/images/panto_patient123_2023.jpg"
}
```

**ClinicalNote Object Structure**:
```json
{
  "note": "Patient shows good oral hygiene",
  "timestamp": ISODate("2024-01-15T10:30:00.000Z"),
  "dentistName": "dr.smith"
}
```

**Sample Document**:
```json
{
  "_id": ObjectId("65a1234567890abcdef12347"),
  "patientProfile": DBRef("patient_profiles", ObjectId("65a1234567890abcdef12346")),
  "dentalChart": {
    "tooth_18": {
      "occlusal": "FILLING",
      "buccal": "HEALTHY"
    }
  },
  "attachments": [
    {
      "filename": "panto_john_2023.jpg",
      "fileType": "PANTOMOGRAPHIC",
      "uploadDate": ISODate("2024-01-15T10:30:00.000Z"),
      "storageUrl": "/storage/images/panto_patient123_2023.jpg"
    }
  ],
  "generalNotes": [
    {
      "note": "Initial examination completed",
      "timestamp": ISODate("2024-01-15T10:30:00.000Z"),
      "dentistName": "dr.smith"
    }
  ],
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

---

### 4. treatment_plans
**Purpose**: Stores treatment plans with planned procedures for patients

| Field | Type | Description | Required | Unique |
|-------|------|-------------|----------|--------|
| _id | ObjectId | MongoDB primary key | Yes | Yes |
| patientProfile | DBRef | Reference to patient_profiles collection | Yes | No |
| planName | String | Name/title of the treatment plan | No | No |
| description | String | Detailed description of the plan | No | No |
| procedures | Array[Object] | List of planned procedures | No | No |
| createdAt | DateTime | Plan creation timestamp | Yes | No |
| updatedAt | DateTime | Last modification timestamp | Yes | No |

**PlannedProcedure Object Structure**:
```json
{
  "id": "proc_123",
  "procedureName": "Composite Filling",
  "procedureCode": "D2391",
  "toothNumbers": ["17"],
  "costEstimate": 150.00,
  "status": "PLANNED",
  "notes": "Treatment needed for cavity",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

**Procedure Status Values**:
- `PLANNED`: Procedure is scheduled but not started
- `IN_PROGRESS`: Procedure has begun but is not complete
- `COMPLETED`: Procedure has been finished
- `CANCELLED`: Procedure was cancelled

**Sample Document**:
```json
{
  "_id": ObjectId("65a1234567890abcdef12348"),
  "patientProfile": DBRef("patient_profiles", ObjectId("65a1234567890abcdef12346")),
  "planName": "2024 Treatment Plan",
  "description": "Comprehensive dental care for John Doe",
  "procedures": [
    {
      "id": "proc_123",
      "procedureName": "Composite Filling",
      "procedureCode": "D2391",
      "toothNumbers": ["17"],
      "costEstimate": 150.00,
      "status": "PLANNED",
      "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
      "updatedAt": ISODate("2024-01-15T10:30:00.000Z")
    }
  ],
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

---

### 5. invoices
**Purpose**: Stores billing information and invoices for patients

| Field | Type | Description | Required | Unique |
|-------|------|-------------|----------|--------|
| _id | ObjectId | MongoDB primary key | Yes | Yes |
| patientProfile | DBRef | Reference to patient_profiles collection | Yes | No |
| issueDate | Date | Date the invoice was generated | Yes | No |
| lineItems | Array[Object] | Individual charges/services | No | No |
| totalAmount | Decimal | Total invoice amount | No | No |
| status | String | Payment status (PAID, UNPAID, PARTIAL) | Yes | No |
| createdAt | DateTime | Invoice creation timestamp | Yes | No |
| updatedAt | DateTime | Last modification timestamp | Yes | No |

**LineItem Object Structure**:
```json
{
  "description": "Composite Filling - Tooth #17",
  "cost": 150.00,
  "quantity": 1,
  "procedureCode": "D2391"
}
```

**Invoice Status Values**:
- `UNPAID`: Invoice has not been paid
- `PAID`: Invoice has been fully paid
- `PARTIAL`: Invoice has been partially paid

**Sample Document**:
```json
{
  "_id": ObjectId("65a1234567890abcdef12349"),
  "patientProfile": DBRef("patient_profiles", ObjectId("65a1234567890abcdef12346")),
  "issueDate": ISODate("2024-01-15T00:00:00.000Z"),
  "lineItems": [
    {
      "description": "Composite Filling",
      "cost": 150.00,
      "quantity": 1,
      "procedureCode": "D2391"
    },
    {
      "description": "Dental Cleaning",
      "cost": 80.00,
      "quantity": 1,
      "procedureCode": "D1110"
    }
  ],
  "totalAmount": 230.00,
  "status": "UNPAID",
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

---

### 6. appointments
**Purpose**: Stores appointment scheduling information

| Field | Type | Description | Required | Unique |
|-------|------|-------------|----------|--------|
| _id | ObjectId | MongoDB primary key | Yes | Yes |
| patientProfile | DBRef | Reference to patient_profiles collection | Yes | No |
| dentist | DBRef | Reference to users collection (dentist) | Yes | No |
| appointmentDate | DateTime | Scheduled appointment date and time | Yes | No |
| appointmentType | String | Type of appointment (checkup, treatment, etc.) | No | No |
| status | String | Appointment status | Yes | No |
| notes | String | Additional notes about the appointment | No | No |
| durationMinutes | Integer | Expected duration in minutes | No | No |
| createdAt | DateTime | Appointment creation timestamp | Yes | No |
| updatedAt | DateTime | Last modification timestamp | Yes | No |

**Appointment Status Values**:
- `SCHEDULED`: Appointment is scheduled
- `COMPLETED`: Appointment was completed
- `CANCELLED`: Appointment was cancelled
- `NO_SHOW`: Patient did not show up

**Sample Document**:
```json
{
  "_id": ObjectId("65a1234567890abcdef1234a"),
  "patientProfile": DBRef("patient_profiles", ObjectId("65a1234567890abcdef12346")),
  "dentist": DBRef("users", ObjectId("65a1234567890abcdef1234b")),
  "appointmentDate": ISODate("2024-02-15T14:30:00.000Z"),
  "appointmentType": "Regular Checkup",
  "status": "SCHEDULED",
  "notes": "Routine examination and cleaning",
  "durationMinutes": 60,
  "createdAt": ISODate("2024-01-15T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00.000Z")
}
```

---

## Relationships

### One-to-One Relationships
- `patient_profiles.user` → `users._id`
- `dental_records.patientProfile` → `patient_profiles._id`

### One-to-Many Relationships
- `treatment_plans.patientProfile` → `patient_profiles._id` (one patient can have multiple treatment plans)
- `invoices.patientProfile` → `patient_profiles._id` (one patient can have multiple invoices)
- `appointments.patientProfile` → `patient_profiles._id` (one patient can have multiple appointments)
- `appointments.dentist` → `users._id` (one dentist can have multiple appointments)

---

## Indexes

### Recommended Indexes for Performance

1. **users**:
   - `{ "username": 1 }` (unique)
   - `{ "email": 1 }` (unique)
   - `{ "roles": 1 }`

2. **patient_profiles**:
   - `{ "user": 1 }`
   - `{ "firstName": 1, "lastName": 1 }`

3. **dental_records**:
   - `{ "patientProfile": 1 }`

4. **treatment_plans**:
   - `{ "patientProfile": 1 }`
   - `{ "procedures.status": 1 }`

5. **invoices**:
   - `{ "patientProfile": 1 }`
   - `{ "status": 1 }`
   - `{ "issueDate": 1 }`

6. **appointments**:
   - `{ "patientProfile": 1 }`
   - `{ "dentist": 1 }`
   - `{ "appointmentDate": 1 }`
   - `{ "status": 1 }`

---

## Data Types Reference

- **ObjectId**: MongoDB's primary key type
- **DBRef**: Reference to another document in the database
- **String**: Text data
- **Date**: Date only (no time component)
- **DateTime**: Full timestamp with date and time
- **Decimal**: High-precision decimal numbers for financial data
- **Integer**: Whole numbers
- **Array**: List of items
- **Object**: Nested document/map structure

---

## Sample Data Relationships

The seeded data includes:
- 1 Admin user (`admin`)
- 2 Dentist users (`dr.smith`, `dr.jones`)  
- 3 Patient users with profiles (`john.doe`, `jane.smith`, `bob.johnson`)
- Each patient has a dental record with sample teeth conditions
- Each patient has a treatment plan with sample procedures
- Each patient has sample appointments (past and future)

This creates a realistic test environment for the dental practice management system.