import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { DatabaseService } from '../../database/database.service';

describe('ClassesController (e2e)', () => {
  let app: INestApplication;
  let dbService: DatabaseService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    dbService = moduleFixture.get<DatabaseService>(DatabaseService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await dbService.class.deleteMany();
  });

  afterAll(async () => {
    await dbService.$disconnect();
    await app.close();
  });

  describe('/api/classes (POST)', () => {
    it('should create a class', () => {
      const createClassDto = {
        name: 'Test Class',
        grade: 5,
        medium: 'BANGLA',
      };

      return request(app.getHttpServer())
        .post('/api/classes')
        .send(createClassDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe(createClassDto.name);
          expect(res.body.data.grade).toBe(createClassDto.grade);
        });
    });

    it('should return 400 for duplicate class name', async () => {
      const createClassDto = {
        name: 'Duplicate Class',
        grade: 6,
        medium: 'BANGLA',
      };

      // Create first class
      await request(app.getHttpServer())
        .post('/api/classes')
        .send(createClassDto)
        .expect(201);

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/api/classes')
        .send(createClassDto)
        .expect(400);
    });
  });

  describe('/api/classes (GET)', () => {
    beforeEach(async () => {
      // Create test classes
      await dbService.class.createMany({
        data: [
          { name: 'Class A', grade: 1, medium: 'BANGLA' },
          { name: 'Class B', grade: 2, medium: 'BANGLA' },
          { name: 'Class C', grade: 3, medium: 'ENGLISH' },
        ],
      });
    });

    it('should return paginated classes', () => {
      return request(app.getHttpServer())
        .get('/api/classes?page=1&limit=2')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('classes');
          expect(res.body.data).toHaveProperty('pagination');
          expect(res.body.data.classes).toHaveLength(2);
          expect(res.body.data.pagination.page).toBe(1);
          expect(res.body.data.pagination.limit).toBe(2);
        });
    });
  });

  describe('/api/classes/by-grade (GET)', () => {
    beforeEach(async () => {
      // Create test classes
      await dbService.class.createMany({
        data: [
          { name: 'Grade 1', grade: 1, medium: 'BANGLA' },
          { name: 'Grade 2', grade: 2, medium: 'BANGLA' },
          { name: 'Grade 8', grade: 8, medium: 'BANGLA' },
          { name: 'Grade 9', grade: 9, medium: 'BANGLA' },
        ],
      });
    });

    it('should return classes filtered by grade range', () => {
      return request(app.getHttpServer())
        .get('/api/classes/by-grade?minGrade=1&maxGrade=3')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.data[0].grade).toBeGreaterThanOrEqual(1);
          expect(res.body.data[1].grade).toBeLessThanOrEqual(3);
        });
    });

    it('should return high school classes', () => {
      return request(app.getHttpServer())
        .get('/api/classes/high-school')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.data[0].grade).toBeGreaterThanOrEqual(8);
        });
    });
  });

  describe('/api/classes/:id (GET)', () => {
    let classId: string;

    beforeEach(async () => {
      const createdClass = await dbService.class.create({
        data: {
          name: 'Test Class',
          grade: 5,
          medium: 'BANGLA',
        },
      });
      classId = createdClass.id;
    });

    it('should return a class by id', () => {
      return request(app.getHttpServer())
        .get(`/api/classes/${classId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(classId);
          expect(res.body.data.name).toBe('Test Class');
        });
    });

    it('should return 404 for non-existent class', () => {
      return request(app.getHttpServer())
        .get('/api/classes/non-existent-id')
        .expect(404);
    });
  });

  describe('/api/classes/:id (PATCH)', () => {
    let classId: string;

    beforeEach(async () => {
      const createdClass = await dbService.class.create({
        data: {
          name: 'Original Class',
          grade: 5,
          medium: 'BANGLA',
        },
      });
      classId = createdClass.id;
    });

    it('should update a class', () => {
      const updateClassDto = {
        name: 'Updated Class',
        grade: 6,
      };

      return request(app.getHttpServer())
        .patch(`/api/classes/${classId}`)
        .send(updateClassDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.name).toBe(updateClassDto.name);
          expect(res.body.data.grade).toBe(updateClassDto.grade);
        });
    });

    it('should return 404 for non-existent class', () => {
      return request(app.getHttpServer())
        .patch('/api/classes/non-existent-id')
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('/api/classes/:id (DELETE)', () => {
    let classId: string;

    beforeEach(async () => {
      const createdClass = await dbService.class.create({
        data: {
          name: 'Class to Delete',
          grade: 5,
          medium: 'BANGLA',
        },
      });
      classId = createdClass.id;
    });

    it('should delete a class', () => {
      return request(app.getHttpServer())
        .delete(`/api/classes/${classId}`)
        .expect(200);
    });

    it('should return 404 for non-existent class', () => {
      return request(app.getHttpServer())
        .delete('/api/classes/non-existent-id')
        .expect(404);
    });
  });
});
