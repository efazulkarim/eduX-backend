# Class-Department Relationship Setup Guide

## Overview

This guide explains the new class-department relationship system that allows you to configure departments on a per-class basis. This solves the issue where departments were globally active/inactive and provides true class-specific department management.

## What Changed

### Before (Global Department System)
- Departments had a single `isActive` field that affected all classes
- `GET /departments/by-class/:classId` returned all globally active departments
- No way to have different departments for different classes

### After (Class-Specific Department System)
- New `ClassDepartment` junction table manages class-department relationships
- Each class can have its own set of active departments
- Departments can be active for some classes and inactive for others

## Database Schema Changes

### New Model: ClassDepartment
```prisma
model ClassDepartment {
  id           String     @id @default(cuid())
  classId      String
  departmentId String
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  class        Class      @relation(fields: [classId], references: [id], onDelete: Cascade)
  department   Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)

  @@unique([classId, departmentId])
  @@map("class_departments")
}
```

### Updated Models
- `Class` model now includes `classDepartments ClassDepartment[]`
- `Department` model now includes `classDepartments ClassDepartment[]`

## New API Endpoints

### 1. Get Class-Specific Department Setup
```http
GET /departments/class-setup/:classId
```

**Response:**
```json
{
  "class": {
    "id": "class-8-id",
    "name": "Eight",
    "medium": "ENGLISH"
  },
  "departments": [
    {
      "id": "dept-science-id",
      "name": "Science",
      "description": "Science Department",
      "isActive": true,
      "classSpecific": {
        "id": "class-dept-relation-id",
        "isActive": true,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      },
      "_count": {
        "sections": 2,
        "subjects": 5
      }
    }
  ]
}
```

### 2. Setup Departments for a Class
```http
POST /departments/class-setup
Content-Type: application/json

{
  "classId": "class-8-id",
  "departments": [
    {
      "departmentId": "dept-science-id",
      "isActive": true
    },
    {
      "departmentId": "dept-business-id",
      "isActive": false
    }
  ]
}
```

### 3. Reset Class Departments
```http
POST /departments/class-reset/:classId
```

### 4. Updated Setup Module Endpoints

The existing setup module endpoints now work with class-department relationships:

```http
# Get departments for setup (now class-specific)
GET /setup/departments?classId=class-8-id

# Save department setup (now creates/updates class-department relationships)
POST /setup/departments/save
{
  "classId": "class-8-id",
  "departments": [
    { "id": "dept-science-id", "isActive": true },
    { "id": "dept-business-id", "isActive": false }
  ]
}

# Reset department setup (now resets class-department relationships)
POST /setup/departments/reset/class-8-id
```

## Migration and Data Setup

### 1. Run the Migration
```bash
npx prisma migrate dev --name add_class_department_junction_table
```

### 2. Seed Class-Department Relationships
```bash
# Run the seeding script
ts-node src/modules/departments/class-department-seed.ts
```

The seed script will:
- Find all active classes and departments
- Create relationships for classes 8 and above (configurable)
- Set all departments as active for eligible classes

## Usage Examples

### Example 1: Setup Departments for Class 8 Only
```bash
# Get current setup
curl -X GET "http://localhost:3000/departments/class-setup/class-8-id"

# Configure Science and Business Studies for Class 8
curl -X POST "http://localhost:3000/departments/class-setup" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "class-8-id",
    "departments": [
      { "departmentId": "science-dept-id", "isActive": true },
      { "departmentId": "business-dept-id", "isActive": true },
      { "departmentId": "arts-dept-id", "isActive": false }
    ]
  }'
```

### Example 2: Different Departments for Different Classes
```bash
# Class 8: Only Science
curl -X POST "http://localhost:3000/departments/class-setup" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "class-8-id",
    "departments": [
      { "departmentId": "science-dept-id", "isActive": true },
      { "departmentId": "business-dept-id", "isActive": false }
    ]
  }'

# Class 9: Science and Business Studies
curl -X POST "http://localhost:3000/departments/class-setup" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "class-9-id",
    "departments": [
      { "departmentId": "science-dept-id", "isActive": true },
      { "departmentId": "business-dept-id", "isActive": true }
    ]
  }'
```

### Example 3: Query Departments by Class
```bash
# This will now return only departments active for Class 8
curl -X GET "http://localhost:3000/departments/by-class/class-8-id"

# This will return only departments active for Class 9
curl -X GET "http://localhost:3000/departments/by-class/class-9-id"
```

## Benefits

1. **True Class-Specific Configuration**: Each class can have its own set of departments
2. **Flexible Setup**: Departments can be active for some classes and inactive for others
3. **Backward Compatibility**: Existing endpoints work but now use class-specific logic
4. **Better Data Integrity**: Clear relationships between classes and departments
5. **Scalable**: Easy to add new classes or departments without affecting existing setups

## Migration Strategy

### For Existing Data
1. Run the migration to create the new table
2. Run the seed script to create initial relationships
3. Review and adjust the relationships as needed
4. Test the new endpoints
5. Update frontend to use new endpoints if needed

### For New Installations
1. The schema includes the new table from the start
2. Use the seed script to set up initial relationships
3. Use the new endpoints for all department management

## Troubleshooting

### Issue: No departments returned for a class
**Solution**: Check if class-department relationships exist:
```sql
SELECT cd.*, c.name as class_name, d.name as dept_name 
FROM class_departments cd
JOIN classes c ON cd.classId = c.id
JOIN departments d ON cd.departmentId = d.id
WHERE cd.classId = 'your-class-id' AND cd.isActive = true;
```

### Issue: Migration fails
**Solution**: Ensure no conflicting data exists and run:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

### Issue: Seed script fails
**Solution**: Ensure classes and departments exist before running the seed script:
```bash
npx prisma db seed
ts-node src/modules/departments/class-department-seed.ts
```

## Next Steps

1. Update your frontend to use the new endpoints
2. Test the class-specific department functionality
3. Configure departments for your specific classes
4. Consider updating any existing business logic that relied on global department status