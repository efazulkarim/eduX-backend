import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ClassesModule } from './modules/classes/classes.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { SectionsModule } from './modules/sections/sections.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ExamsModule } from './modules/exams/exams.module';
import { FeesModule } from './modules/fees/fees.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SetupModule } from './modules/setup/setup.module';
// import { JwtAuthGuard } from './common/guards/auth.guard';
// import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    ClassesModule,
    DepartmentsModule,
    SectionsModule,
    SubjectsModule,
    AttendanceModule,
    ExamsModule,
    FeesModule,
    NotificationsModule,
    SetupModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Temporarily disable auth guards
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule {}
