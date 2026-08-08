import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PayrollService } from './src/payroll/payroll.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const payrollService = app.get(PayrollService);

  console.log('--- GENERATING PAYROLL ---');
  const genResult = await payrollService.generateMonthlyPayroll(8, 2026);
  console.log('Generated:', genResult.length, 'payrolls');

  console.log('--- CREDITING SALARIES ---');
  const credResult = await payrollService.creditMonthlySalaries();
  console.log('Credited:', credResult.length, 'salaries');

  await app.close();
}
bootstrap().catch(console.error);
