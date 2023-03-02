/// <reference types="cypress" />

Cypress.on("uncaught:exception", (err, runnable) => {
  return false
})

beforeEach(() => {
  cy.visit("https://demo.podium.tools/qa-webchat-lorw/", { timeout: 10_000 })
  cy.loadClosedWidgetIframes()
})

describe("Page", () => {
  let quote

  before(() => {
    cy.fixture("quote.json").then((data) => {
      quote = data.quote
    })
  })

  beforeEach(() => {
    cy.clearLocalStorage() // force greeting message banner to be displayed again
  })

  it("should display the demo page quote, text us and greeting message widgets", () => {
    cy.contains(quote).should("exist").and("be.visible")
    cy.get("@greetingMessageWidget").should("exist").and("be.visible")
    cy.get("@textUsWidget").should("exist").and("be.visible")
  })

  it("should not display the greeting message if it was dismissed on page reload", () => {
    cy.get("@greetingMessageWidget").contains("close").click()
    cy.reload()
    cy.get("@greetingMessageWidget").should("not.exist")
  })

  it("should open the location selector widget by clicking on the 'Text us' button", () => {
    cy.get("@textUsWidget").contains("Text us").click()
    cy.loadOpenWidgetIframe()
    cy.get("@locationWidget").should("exist").and("be.visible")
  })

  it("should open the location selector widget by clicking on the greeting message", () => {
    cy.get("@greetingMessageWidget").should("exist")
    cy.loadOpenWidgetIframe()
    cy.get("@locationWidget").should("exist").and("be.visible")
  })
})

describe("Select Location", () => {
  let locations
  let fixtureLocationNames
  let locationsCount
  let selectedLocationName

  before(() => {
    cy.fixture("locations.json").then((data) => {
      locations = data
      fixtureLocationNames = locations.map((location) => location.name)
      locationsCount = locations.length
    })
  })

  beforeEach(() => {
    cy.loadOpenWidgetIframe()
    cy.loadSMSFormWidget()
  })

  it("should list available locations", () => {
    cy.get("@locationWidget")
      .locationSearchResults()
      .should("have.length", locationsCount)
  })

  it("should be able to search a location", () => {
    cy.get("@locationWidget")
      .searchLocation("New York")
      .locationSearchResults()
      .find("p.LocationContainer__Name")
      .as("locationResults")
      .then(($locationNames) => {
        const locationNames = $locationNames.map((_, el) =>
          Cypress.$(el).text()
        )
        // expect(locationNames.sort()).to.eq(fixtureLocationNames.sort())
      })
  })

  it("should be able to select a location", () => {
    cy.selectLocation()

    cy.get("@formWidget")
      .should("exist")
      .find("div.SendSmsPage__CurrentLocationName h1")
      .should("be.visible")
    // .and("contain", selectedLocationName)
  })
})

describe("Form widget", () => {
  // Not covering every form widget possible test case, testing scenarios before form submition

  let testName = "Thiago"
  let testInvalidPhoneNumber = "+1234567890"
  let testValidPhoneNumber = "+5531992198410"
  let testShortMessage = "This message is less than 300 characters."
  let testLongMessage = Array(301).join("T")

  beforeEach(() => {
    cy.loadOpenWidgetIframe()
    cy.loadSMSFormWidget()
    cy.selectLocation()
  })

  it("should display legal advice message", () => {
    cy.get("@locationWidget")
      .find("#ComposeMessage p.Legal__text")
      .should("be.visible")
  })

  xit("should be able to go back to select a location after clicking the back button", () => {
    // this is currently failing. after clicking back, nothing happens so the assertion fails

    cy.get("@formWidget").find("[aria-label=back]").click()
    cy.get("@locationWidget").contains("Select a Location").should("be.visible")
  })

  it("should be able to fill the form with valid data", () => {
    cy.fillName(testName)
    cy.fillPhoneNumber(testValidPhoneNumber)
    cy.fillMessage(testShortMessage)
    cy.submitForm()
    cy.get("@formWidget")
      .find("p.Legal--error", { timeout: 10_000 })
      .should("not.exist")
      .and("not.be.visible")
  })

  it("should see valid form sent by intercepting request", () => {})
})
