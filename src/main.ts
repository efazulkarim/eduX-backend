import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS Configuration
  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173', // Vite default
        'http://localhost:4173', // Vite preview
        process.env.FRONTEND_URL,
        process.env.CORS_ORIGIN,
      ].filter(Boolean); // Remove undefined values

      // In production, you can also allow specific domains
      if (process.env.NODE_ENV === 'production') {
        // Add your production domains here
        // allowedOrigins.push('https://yourdomain.com');
        // allowedOrigins.push('https://www.yourdomain.com');
        // allowedOrigins.push('https://admin.yourdomain.com');
      }

      // Allow all origins in development
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma',
    ],
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('School Management System API')
    .setDescription('API documentation for School Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📖 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
