import config from './jest.config';

export default {
  ...config,
  testEnvironment: './prisma/prisma-test-environment.ts',
  testMatch: [
    "**/src/tests/e2e/**/*.e2e-spec.ts"
  ]
};
