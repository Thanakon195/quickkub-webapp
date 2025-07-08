export const developmentConfig = {
  database: {
    host: 'localhost',
    port: 5432,
    username: 'quickkub_user',
    password: 'quickkub_password',
    database: 'quickkub_db',
  },
  redis: {
    host: 'localhost',
    port: 6379,
    password: '',
    db: 0,
  },
  jwt: {
    secret: 'dev-jwt-secret-key-change-in-production',
    expiresIn: '7d',
    refreshExpiresIn: '30d',
  },
  server: {
    port: 3002,
    nodeEnv: 'development',
    appEnv: 'development',
  },
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'],
    credentials: true,
  },
  s3: {
    endpoint: 'localhost:9000',
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
    bucket: 'quickkub-storage',
    region: 'us-east-1',
    forcePathStyle: true,
  },
  rateLimit: {
    windowMs: 900000,
    maxRequests: 100,
  },
  development: {
    debug: true,
    logSqlQueries: false,
    enableSwagger: true,
    enableGraphqlPlayground: false,
  },
  queue: {
    prefix: 'quickkub',
  },
  webhook: {
    hmacSecret: 'dev-webhook-secret-key',
    maxRetries: 5,
    retryDelay: 5000,
    timeout: 30000,
  },
  sandbox: {
    enabled: true,
    merchantId: 'test_merchant_001',
    apiKey: 'test_api_key_001',
  },
};
