const { defineConfig } = require("cypress")

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    fixturesFolder: "cypress/fixtures",
    defaultCommandTimeout: 10_000,
    // viewportWidth: 1280,
    // viewportHeight: 960,
  },
})
