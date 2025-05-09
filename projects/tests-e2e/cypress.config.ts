import { defineConfig } from 'cypress';

export default defineConfig({
    env: {

    },

    video: false,
    defaultCommandTimeout: 30000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    pageLoadTimeout: 120000,

    reporter: 'junit',

    reporterOptions: {
        mochaFile: './results/e2e-test-result-[hash].xml',
        toConsole: true
    },

    chromeWebSecurity: false,
    downloadsFolder: './downloads',
    fixturesFolder: './fixtures',
    screenshotsFolder: './screenshots',
    videosFolder: './videos',

    e2e: {
        baseUrl: 'http://localhost:4200',
        specPattern: './*.cy.{js,jsx,ts,tsx}',
        supportFile: './support/index.ts',
        experimentalRunAllSpecs: true
    }
});
