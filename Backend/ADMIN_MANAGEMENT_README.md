# Backend Admin Management Implementation

This document summarizes the Java backend code created for the admin user management system.

## Files Created

### 1. **AdminController.java**
**Location:** `src/main/java/com/dentistplus/controller/AdminController.java`

REST controller for admin operations with 8 endpoints:

#### Endpoints:
- `GET /api/admin/dentists` - Get all dentists
- `POST /api/admin/dentists` - Create new dentist
- `PUT /api/admin/dentists/{dentistId}` - Update dentist
- `DELETE /api/admin/dentists/{dentistId}` - Delete dentist
- `GET /api/admin/patients` - Get all patients
- `POST /api/admin/patients` - Create new patient
- `PUT /api/admin/patients/{patientId}` - Update patient
- `DELETE /api/admin/patients/{patientId}` - Delete patient

**Security:** All endpoints require `X-User-ID` header and verify admin role via AdminService.

---

### 2. **AdminService.java**
**Location:** `src/main/java/com/dentistplus/service/AdminService.java`

Service class implementing all admin business logic:

#### Methods:
- `getAllDentists(String adminUserId)` - Returns list of all users with ROLE_DENTIST
- `getAllPatients(String adminUserId)` - Returns list of all users with ROLE_PATIENT
- `createDentist(CreateUserRequest, String adminUserId)` - Creates new dentist user
- `createPatient(CreateUserRequest, String adminUserId)` - Creates new patient user and patient profile
- `updateDentist(String dentistId, UpdateUserRequest, String adminUserId)` - Updates dentist details
- `updatePatient(String patientId, UpdateUserRequest, String adminUserId)` - Updates patient details
- `deleteDentist(String dentistId, String adminUserId)` - Deletes dentist user
- `deletePatient(String patientId, String adminUserId)` - Deletes patient user and associated profile
- `verifyAdminRole(String adminUserId)` - Private helper to verify admin permissions

#### Features:
- Admin role verification on all operations
- Duplicate email/username validation
- Role-based user validation (ensures dentists are deleted as dentists, etc.)
- Automatic patient profile creation when creating patients
- Automatic patient profile deletion when deleting patients
- Timestamp updates on modifications
- Comprehensive logging

---

### 3. **CreateUserRequest.java**
**Location:** `src/main/java/com/dentistplus/dto/CreateUserRequest.java`

DTO for creating new users (dentists or patients):

#### Fields:
- `username: String` (required, 3-50 chars)
- `firstName: String` (required, 1-100 chars)
- `lastName: String` (required, 1-100 chars)
- `email: String` (required, valid email format)
- `password: String` (required, 6-100 chars)

#### Validation:
All fields are validated using Jakarta validation annotations.

---

### 4. **UpdateUserRequest.java**
**Location:** `src/main/java/com/dentistplus/dto/UpdateUserRequest.java`

DTO for updating existing users:

#### Fields (all optional):
- `firstName: String` (1-100 chars if provided)
- `lastName: String` (1-100 chars if provided)
- `email: String` (valid email format if provided)
- `password: String` (6-100 chars if provided)

#### Validation:
All fields are optional and validated only if provided. No field is required for updates.

---

## API Request/Response Examples

### Create Dentist
```bash
POST /api/admin/dentists
Header: X-User-ID: {adminUserId}
Content-Type: application/json

{
  "username": "dr.johnson",
  "firstName": "Michael",
  "lastName": "Johnson",
  "email": "michael.johnson@dental.com",
  "password": "securepass123"
}

Response 200:
{
  "id": "507f1f77bcf86cd799439011",
  "username": "dr.johnson",
  "firstName": "Michael",
  "lastName": "Johnson",
  "email": "michael.johnson@dental.com",
  "roles": ["ROLE_DENTIST"],
  "createdAt": "2025-12-01 10:30:00",
  "updatedAt": "2025-12-01 10:30:00"
}
```

### Create Patient
```bash
POST /api/admin/patients
Header: X-User-ID: {adminUserId}
Content-Type: application/json

{
  "username": "patient.user",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@email.com",
  "password": "patientpass123"
}

Response 200:
{
  "id": "507f1f77bcf86cd799439012",
  "username": "patient.user",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@email.com",
  "roles": ["ROLE_PATIENT"],
  "createdAt": "2025-12-01 10:31:00",
  "updatedAt": "2025-12-01 10:31:00"
}
```

### Update Dentist
```bash
PUT /api/admin/dentists/{dentistId}
Header: X-User-ID: {adminUserId}
Content-Type: application/json

{
  "firstName": "Michael Updated",
  "lastName": "Johnson Updated"
}

Response 200: Updated user object
```

### Delete Patient
```bash
DELETE /api/admin/patients/{patientId}
Header: X-User-ID: {adminUserId}

Response 204: No Content
```

### Get All Dentists
```bash
GET /api/admin/dentists
Header: X-User-ID: {adminUserId}

Response 200:
[
  {
    "id": "507f1f77bcf86cd799439011",
    "username": "dr.smith",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@dental.com",
    "roles": ["ROLE_DENTIST"],
    "createdAt": "2025-12-01 09:00:00",
    "updatedAt": "2025-12-01 09:00:00"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "username": "dr.jones",
    "firstName": "Sarah",
    "lastName": "Jones",
    "email": "sarah.jones@dental.com",
    "roles": ["ROLE_DENTIST"],
    "createdAt": "2025-12-01 09:05:00",
    "updatedAt": "2025-12-01 09:05:00"
  }
]
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Successful GET, POST, PUT operations
- `204 No Content` - Successful DELETE operations
- `400 Bad Request` - Validation errors or duplicate username/email
- `401 Unauthorized` - Missing or invalid X-User-ID header, non-admin user
- `404 Not Found` - User not found for update/delete operations

### Error Response Format:
```json
{
  "timestamp": "2025-12-01T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Username already exists",
  "path": "/api/admin/dentists"
}
```

---

## Security Considerations

1. **Admin Role Verification:** All operations verify the requester has ROLE_ADMIN
2. **X-User-ID Header:** Required on all requests to identify the admin user
3. **Validation:** Input validation on all DTOs prevents invalid data
4. **Duplicate Prevention:** Unique constraint checking on username and email
5. **Role Validation:** When updating/deleting, verifies user has correct role
6. **Cascade Delete:** Deleting patient also deletes associated patient profile

---

## Integration with Frontend

The frontend AdminDashboard.tsx component calls these endpoints via apiClient:

```typescript
// Load dentists
await apiClient.getAllDentists() // GET /api/admin/dentists

// Create dentist
await apiClient.createDentist(userData) // POST /api/admin/dentists

// Update dentist
await apiClient.updateDentist(dentistId, userData) // PUT /api/admin/dentists/{id}

// Delete dentist
await apiClient.deleteDentist(dentistId) // DELETE /api/admin/dentists/{id}

// Same methods for patients (getAllPatientUsers, createPatient, updatePatientUser, deletePatientUser)
```

---

## Testing the Endpoints

Use curl or Postman to test. Example with admin user created by DataSeeder:

```bash
# Login as admin to get ID
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Get admin ID from response
# Then use that ID in X-User-ID header

# Get all dentists
curl -X GET http://localhost:8080/api/admin/dentists \
  -H "X-User-ID: {admin-id-from-login}"
```

---

## Notes

- Passwords are stored in plain text (not hashed) - consider implementing bcrypt for production
- Default date of birth for patients created via admin is "1990-01-01"
- Patient profiles are automatically created/deleted with user accounts
- All timestamps are stored in UTC format
- The AdminService uses logging for audit trail purposes
