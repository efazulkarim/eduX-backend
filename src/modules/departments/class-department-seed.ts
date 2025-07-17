/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedClassDepartments() {
  console.log('Seeding class-department relationships...');

  try {
    // Get existing classes and departments
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const departments = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    if (classes.length === 0 || departments.length === 0) {
      console.log(
        'No classes or departments found. Please seed classes and departments first.',
      );
      return;
    }

    // Define which departments should be available for which classes
    // Assuming departments are only for Class 8 and above
    const classesWithDepartments = classes.filter((cls) => {
      const className = cls.name.toLowerCase();
      // Include classes 9, 10, 11, 12, etc.
      return (
        /^(nine|ten|eleven|twelve|\d+)$/i.test(className) ||
        parseInt(className) >= 9
      );
    });

    console.log(
      `Found ${classesWithDepartments.length} classes that should have departments:`,
    );
    classesWithDepartments.forEach((cls) => console.log(`- ${cls.name}`));

    // Create class-department relationships
    const classDepartmentData: Array<{
      classId: string;
      departmentId: string;
      isActive: boolean;
    }> = [];

    for (const cls of classesWithDepartments) {
      for (const dept of departments) {
        classDepartmentData.push({
          classId: cls.id,
          departmentId: dept.id,
          isActive: true,
        });
      }
    }

    // Use upsert to avoid conflicts
    for (const data of classDepartmentData) {
      await prisma.classDepartment.upsert({
        where: {
          classId_departmentId: {
            classId: data.classId,
            departmentId: data.departmentId,
          },
        },
        update: {
          isActive: data.isActive,
        },
        create: data,
      });
    }

    console.log(
      `✅ Created ${classDepartmentData.length} class-department relationships`,
    );

    // Display summary
    const summary = await prisma.classDepartment.groupBy({
      by: ['classId'],
      where: { isActive: true },
      _count: {
        departmentId: true,
      },
    });

    console.log('\nSummary of active class-department relationships:');
    for (const item of summary) {
      const className = classes.find((c) => c.id === item.classId)?.name;
      console.log(`- ${className}: ${item._count.departmentId} departments`);
    }
  } catch (error) {
    console.error('Error seeding class-department relationships:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedClassDepartments()
    .then(() => {
      console.log('Class-department seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Class-department seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
