import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { AdmissionFormService } from './admission-form.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService, AdmissionFormService],
  exports: [StudentsService, AdmissionFormService],
})
export class StudentsModule {}
