import 'reflect-metadata';

process.env.JWT_SECRET ??= 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN ??= '1h';
process.env.DATABASE_URL ??= 'mysql://test:test@localhost:3306/test';
process.env.MONGODB_URI ??= 'mongodb://localhost:27017/test';
