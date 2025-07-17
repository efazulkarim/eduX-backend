import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1234567890',
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample classes
  const classes = [
    { name: 'Play', medium: 'BANGLA' },
    { name: 'Nursery', medium: 'BANGLA' },
    { name: 'KG', medium: 'BANGLA' },
    { name: 'One', medium: 'BANGLA' },
    { name: 'Two', medium: 'BANGLA' },
    { name: 'Three', medium: 'BANGLA' },
    { name: 'Four', medium: 'BANGLA' },
    { name: 'Five', medium: 'BANGLA' },
    { name: 'Six', medium: 'BANGLA' },
    { name: 'Seven', medium: 'BANGLA' },
    { name: 'Eight', medium: 'BANGLA' },
    { name: 'Nine', medium: 'BANGLA' },
    { name: 'Ten', medium: 'BANGLA' },
  ];

  for (const classData of classes) {
    await prisma.class.upsert({
      where: { name: classData.name },
      update: {},
      create: {
        name: classData.name,
        medium: classData.medium as any,
        isActive: true,
      },
    });
  }

  console.log('✅ Classes created');

  // Create sample departments
  const departments = [
    { name: 'Science', description: 'Science department' },
    { name: 'Business Studies', description: 'Business Studies department' },
    { name: 'Humanities', description: 'Humanities department' },
    {
      name: 'Vocational - General Mechanics',
      description: 'Vocational General Mechanics',
    },
    { name: 'Vocational - Electrical', description: 'Vocational Electrical' },
    { name: 'Vocational', description: 'General Vocational' },
    { name: 'B.S.S', description: 'Bachelor of Social Science' },
  ];

  for (const deptData of departments) {
    const existingDept = await prisma.department.findFirst({
      where: { name: deptData.name },
    });

    if (!existingDept) {
      await prisma.department.create({
        data: {
          name: deptData.name,
          description: deptData.description,
          isActive: true,
        },
      });
    }
  }

  console.log('✅ Departments created');

  // Create sample teacher user and teacher
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@school.com' },
    update: {},
    create: {
      email: 'teacher@school.com',
      password: hashedPassword,
      role: 'TEACHER',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567891',
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      employeeId: 'EMP001',
      dateOfBirth: new Date('1985-01-01'),
      gender: 'MALE' as const,
      address: '123 Teacher Street',
      phone: '+1234567891',
      qualification: 'Masters in Education',
      experience: 5,
      salary: 50000,
      isActive: true,
    },
  });

  console.log('✅ Sample teacher created');

  // Create sample sections for some classes
  const oneClass = await prisma.class.findUnique({ where: { name: 'One' } });
  const eightClass = await prisma.class.findUnique({
    where: { name: 'Eight' },
  });
  const scienceDept = await prisma.department.findFirst({
    where: { name: 'Science' },
  });

  if (oneClass) {
    // Create sections for Class One (no department needed)
    const sectionNames = ['A', 'B', 'C'];
    for (const sectionName of sectionNames) {
      const existingSection = await prisma.section.findFirst({
        where: {
          classId: oneClass.id,
          departmentId: null,
          name: sectionName,
        },
      });

      if (!existingSection) {
        await prisma.section.create({
          data: {
            name: sectionName,
            classId: oneClass.id,
            capacity: 30,
            isActive: true,
          },
        });
      }
    }
  }

  if (eightClass && scienceDept) {
    // Create sections for Class Eight with Science department
    const sectionNames = ['A', 'B'];
    for (const sectionName of sectionNames) {
      await prisma.section.upsert({
        where: {
          classId_departmentId_name: {
            classId: eightClass.id,
            departmentId: scienceDept.id,
            name: sectionName,
          },
        },
        update: {},
        create: {
          name: sectionName,
          classId: eightClass.id,
          departmentId: scienceDept.id,
          capacity: 30,
          isActive: true,
        },
      });
    }
  }

  console.log('✅ Sample sections created');

  // Create sample students
  const sampleStudents = [
    {
      firstName: 'Rakib',
      lastName: 'Ahmed',
      rollNumber: '001',
      admissionNo: 'ADM001',
      dateOfBirth: new Date('2016-06-02'),
      gender: 'MALE' as const,
      address: 'Dhaka',
      fatherName: 'OWASIM HOSEN',
      motherName: 'BILKIS BEGUM',
      parentPhone: '0175621',
      medium: 'BANGLA' as const,
      academicYear: '2024',
      bloodGroup: 'O+',
      shift: 'MORNING' as const,
    },
    {
      firstName: 'ADIB',
      lastName: 'MAHMUD',
      rollNumber: '002',
      admissionNo: 'ADM002',
      dateOfBirth: new Date('2016-05-15'),
      gender: 'MALE' as const,
      address: 'Dhaka',
      fatherName: 'Fatema Jannat Mukta',
      motherName: 'Rashida Begum',
      parentPhone: '01756221',
      medium: 'BANGLA' as const,
      academicYear: '2024',
      shift: 'DAY' as const,
    },
    {
      firstName: 'AYMAN',
      lastName: 'FARABI',
      rollNumber: '003',
      admissionNo: 'ADM003',
      dateOfBirth: new Date('2016-04-20'),
      gender: 'MALE' as const,
      address: 'Dhaka',
      fatherName: 'HOSNE ARA',
      motherName: 'Salma Khatun',
      parentPhone: '01611501750',
      medium: 'BANGLA' as const,
      academicYear: '2024',
      shift: 'EVENING' as const,
    },
    {
      firstName: 'MD. SAAD BIN',
      lastName: 'SAYED',
      rollNumber: '004',
      admissionNo: 'ADM004',
      dateOfBirth: new Date('2016-03-10'),
      gender: 'MALE' as const,
      address: 'Dhaka',
      fatherName: 'ISME TARA',
      motherName: 'Nasreen Akter',
      parentPhone: '01756224',
      medium: 'BANGLA' as const,
      academicYear: '2024',
      shift: 'MORNING' as const,
    },
    {
      firstName: 'MEHERAJ HOSSAIN',
      lastName: 'SHAFIN',
      rollNumber: '005',
      admissionNo: 'ADM005',
      dateOfBirth: new Date('2016-02-25'),
      gender: 'MALE' as const,
      address: 'Dhaka',
      fatherName: 'JANNATUL FERDOWS',
      motherName: 'Rashida Begum',
      parentPhone: '01756225',
      medium: 'BANGLA' as const,
      academicYear: '2024',
      shift: 'DAY' as const,
    },
    {
      firstName: 'MOHAIMINUL',
      lastName: 'BARI',
      rollNumber: '006',
      admissionNo: 'ADM006',
      dateOfBirth: new Date('2016-01-15'),
      gender: 'MALE' as const,
      address: 'Dhaka',
      fatherName: 'JOSNA AKTER',
      motherName: 'Fatema Khatun',
      parentPhone: '01756226',
      medium: 'BANGLA' as const,
      academicYear: '2024',
      shift: 'EVENING' as const,
    },
    {
      firstName: 'MOHAMMAD',
      lastName: 'SAMI',
      rollNumber: '007',
      admissionNo: 'ADM007',
      dateOfBirth: new Date('2015-12-20'),
      gender: 'MALE' as const,
      address: 'Dhaka',
      fatherName: 'Khalifa Haque',
      motherName: 'Rashida Begum',
      parentPhone: '01756227',
      medium: 'BANGLA' as const,
      academicYear: '2024',
      shift: 'MORNING' as const,
    },
    {
      firstName: 'NAZIHA',
      lastName: 'ZAHEEN',
      rollNumber: '008',
      admissionNo: 'ADM008',
      dateOfBirth: new Date('2015-11-10'),
      gender: 'FEMALE' as const,
      address: 'Dhaka',
      fatherName: 'KHADRUN NAHAR',
      motherName: 'Salma Khatun',
      parentPhone: '01756228',
      medium: 'BANGLA' as const,
      academicYear: '2024',
      shift: 'DAY' as const,
    },
  ];

  // Get a section to assign students to
  const sampleSection = await prisma.section.findFirst({
    where: { classId: oneClass?.id },
  });

  for (const studentData of sampleStudents) {
    const createData: any = {
      ...studentData,
    };
    
    if (sampleSection?.id) {
      createData.sectionId = sampleSection.id;
    }
    
    await prisma.student.upsert({
      where: { rollNumber: studentData.rollNumber },
      update: {},
      create: createData,
    });
  }

  console.log('✅ Sample students created');

  // Create sample fee types
  const feeTypes = [
    {
      name: 'Monthly Tuition',
      amount: 5000,
      description: 'Monthly tuition fee',
    },
    {
      name: 'Admission Fee',
      amount: 10000,
      description: 'One-time admission fee',
    },
    { name: 'Exam Fee', amount: 1000, description: 'Examination fee' },
  ];

  for (const feeType of feeTypes) {
    await prisma.feeType.upsert({
      where: { name: feeType.name },
      update: {},
      create: {
        name: feeType.name,
        amount: feeType.amount,
        description: feeType.description,
        isActive: true,
      },
    });
  }

  console.log('✅ Fee types created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 Sample credentials:');
  console.log('Admin: admin@school.com / admin123');
  console.log('Teacher: teacher@school.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
