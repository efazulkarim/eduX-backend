# School Management Setup API Guide

## Overview

Enhanced your NestJS backend with comprehensive setup functionality that matches your frontend UI requirements. The system now supports bulk operations, reset functionality, and unified setup workflows.

## New Features Added

### 1. Bulk Update DTOs

- `BulkUpdateClassDto` - For updating multiple classes at once
- `BulkUpdateDepartmentDto` - For updating multiple departments at once
- `BulkUpdateSectionDto` - For updating multiple sections at once

### 2. Setup-Specific DTOs

- `ClassSetupDto` - For medium-wise class configuration
- `DepartmentSetupDto` - For class-specific department setup
- `SectionSetupDto` - For section management with teacher assignments

### 3. Enhanced Controllers

All existing controllers now have additional endpoints:

- `POST /classes/setup` - Bulk class setup
- `POST /classes/bulk-update` - Bulk status updates
- `POST /classes/reset` - Reset all classes
- Similar endpoints for departments and sections

### 4. Unified Setup Module

New `/setup` endpoints that match your UI workflow:

## API Endpoints for Frontend Integration

### Medium-Wise Class Setup

```http
# Get classes for setup (matches your first UI screen)
GET /setup/classes?medium=BANGLA

# Save class configuration
POST /setup/classes/save
{
  "medium": "BANGLA",
  "classes": [
    { "id": "class-id-1", "isActive": true },
    { "id": "class-id-2", "isActive": false }
  ]
}

# Reset classes
POST /setup/classes/reset?medium=BANGLA
```

### Class-Wise Department Setup

```http
# Get departments for a class (matches your second UI screen)
GET /setup/departments?classId=class-id-123

# Save department configuration
POST /setup/departments/save
{
  "classId": "class-id-123",
  "departments": [
    { "id": "dept-id-1", "isActive": true },
    { "id": "dept-id-2", "isActive": false }
  ]
}

# Reset departments for a class
POST /setup/departments/reset/class-id-123
```

### Section Setup

```http
# Get sections for class/department (matches your third UI screen)
GET /setup/sections?classId=class-id-123&departmentId=dept-id-456

# Save section configuration
POST /setup/sections/save
{
  "classId": "class-id-123",
  "departmentId": "dept-id-456",
  "sections": [
    {
      "id": "section-id-1",
      "name": "A",
      "isActive": true,
      "teacherId": "teacher-id-123"
    },
    {
      "name": "B",
      "isActive": true,
      "teacherId": null
    }
  ]
}

# Reset sections
POST /setup/sections/reset
{
  "classId": "class-id-123",
  "departmentId": "dept-id-456"
}
```

## Key Features

### 1. Validation

- All endpoints validate that referenced entities exist
- Proper error messages for missing or invalid data
- Transaction support for bulk operations

### 2. Flexibility

- Optional parameters where appropriate
- Support for both creating new and updating existing records
- Handles null/undefined values gracefully

### 3. Response Format

All setup endpoints return:

- Success/error status
- Updated entity counts
- Relevant data for frontend display

### 4. Error Handling

- `400 Bad Request` for invalid data
- `404 Not Found` for missing entities
- Descriptive error messages

## Testing the APIs

### 1. Start your server

```bash
npm run start:dev
```

### 2. Access Swagger Documentation

Visit `http://localhost:3000/api` to see all endpoints with interactive testing

### 3. Test the Setup Workflow

1. First test class setup with medium filter
2. Then test department setup for a specific class
3. Finally test section setup with teacher assignments

## Frontend Integration Tips

### 1. State Management

- Use the setup endpoints to load initial data
- Track active/inactive states locally
- Batch updates when user clicks "Save"

### 2. UI Flow

- Load classes by medium → Show checkboxes → Save selection
- Load departments by class → Show checkboxes → Save selection
- Load sections by class/department → Show with teacher dropdowns → Save

### 3. Reset Functionality

- Call reset endpoints when user clicks "Reset" buttons
- Refresh UI data after reset operations

## Database Schema Alignment

Your Prisma schema supports all these operations with:

- `isActive` fields on all relevant models
- Proper relationships between Class, Department, Section
- Teacher assignments to sections
- Unique constraints to prevent duplicates

The enhanced backend now fully supports your frontend setup workflow with proper validation, error handling, and bulk operations!
