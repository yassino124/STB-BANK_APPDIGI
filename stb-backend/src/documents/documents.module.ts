import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { EmployeeDocument, EmployeeDocumentSchema } from './schemas/document.schema';
import { EmployeesModule } from '../employees/employees.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployeeDocument.name, schema: EmployeeDocumentSchema },
    ]),
    EmployeesModule,
    CloudinaryModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
