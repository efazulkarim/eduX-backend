# School Management System Backend

A comprehensive NestJS backend for managing school operations including students, teachers, classes, attendance, exams, and fees.

## Features

- 🔐 JWT Authentication & Authorization
- 👥 User Management (Students, Teachers, Admins)
- 📚 Class & Subject Management
- 📊 Attendance Tracking
- 📝 Exam Management
- 💰 Fee Management
- 📨 Notifications System
- 🗄️ PostgreSQL Database with Prisma ORM
- 📖 Swagger API Documentation

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: class-validator
- **Documentation**: Swagger

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```
