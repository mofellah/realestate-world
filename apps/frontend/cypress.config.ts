import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'apps/frontend/cypress/e2e/**/*.cy.ts',
    supportFile: 'apps/frontend/cypress/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // placeholder for future event handling
      return config;
    },
  },
});
