import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:4173",
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // placeholder for future event handling
      return config;
    },
  },
});
