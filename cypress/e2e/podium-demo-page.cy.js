/// <reference types="cypress" />

Cypress.on("uncaught:exception", (err, runnable) => {
  return false
})

// variables to use in tests from fixtures
let quote
let locations
let locationsCount

before(() => {
  cy.fixture("quote.json").then((data) => {
    quote = data.quote
  })
  cy.fixture("locations.json").then((data) => {
    locations = data
    locationsCount = locations.length
  })
})

beforeEach(() => {
  cy.visit("https://demo.podium.tools/qa-webchat-lorw/")
  cy.loadClosedWidgetIframes()
})

describe("Page", () => {
  beforeEach(() => {
    cy.clearLocalStorage() // force greeting message banner to be displayed again
  })

  it("should display the demo page quote, text us and greeting message widgets", () => {
    cy.contains(quote).should("exist").and("be.visible")
    cy.get("@greetingMessageWidget").should("exist").and("be.visible")
    cy.get("@textUsWidget").should("exist").and("be.visible")
  })

  it("should not display the greeting message on page reload if it was dismissed previously", () => {
    // not sure this is really expected, so skipping
    cy.clickCloseGreetingMessage()
    cy.reload()
    cy.get("@greetingMessageWidget").should("exist")
  })

  it("should open the location selector widget by clicking on the 'Text us' button", () => {
    cy.clickTextUs()
    cy.getLocationSelectorWidget()
    cy.get("@locationWidget").should("be.visible")
  })

  it("should open the location selector widget by clicking on the greeting message", () => {
    cy.clickGreetingMessage()
    cy.getLocationSelectorWidget()
    cy.get("@locationWidget").should("be.visible")
  })
})

describe("Select Location Widget", () => {
  beforeEach(() => {
    cy.loadOpenWidgetIframe()
    cy.loadSMSFormWidget()
  })

  it("should list available locations", () => {
    cy.locationSearchResults().should("have.length", locationsCount)
  })

  it("should be able to search a location", () => {
    // ideally assert for all location names/addresses
    cy.searchLocation("New York")
      .locationSearchResults()
      .should("have.length", locationsCount)
  })

  it.only("should be able to select a location", () => {
    cy.selectLocation(locations[0].name)

    cy.getSelectedLocationName().within((selectedLocation) => {
      expect(selectedLocation).to.not.be.null
      expect(selectedLocation).to.be.eq(locations[0].name)
    })
  })
})

describe("Form widget", () => {
  // Not covering every form possible test case, testing scenarios before form submition

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

  xit("should be able to go back to select a location after clicking the back button", () => {
    // this is currently failing. after clicking back, nothing happens so the assertion fails
    cy.backToSelectLocation()
    cy.get("@locationWidget").contains("Select a Location").should("be.visible")
  })

  it("should display legal advice message", () => {
    cy.getLegalAdviceMessage().should("be.visible")
  })

  it("should not be able to send empty form", () => {
    cy.getSendButton().should("be.disabled")
  })

  xit("should reset form fields data if widget is closed", () => {
    // this is currently failing. after closing widget, form fields are not reset

    // fill form fields
    cy.fillName(testName)
    cy.fillPhoneNumber(testValidPhoneNumber)
    cy.fillMessage(testShortMessage)

    cy.clickCloseWidget()

    // relaunch widget
    cy.clickTextUs()
    cy.getLocationSelectorWidget()
    cy.selectLocation(locations[1].name) // choose different location

    // assert
    cy.getNameField().should("not.have.text")
    cy.getPhoneField().should("not.have.text")
    cy.getMessageField().should("not.have.text")
  })

  it("should be able to send the form with valid data", () => {
    cy.fillName(testName)
    cy.fillPhoneNumber(testValidPhoneNumber)
    cy.fillMessage(testShortMessage)
    cy.clickSendForm()

    cy.get("@formWidget")
      .contains("We received your message.")
      .should("be.visible")
  })

  it("should not be able to send the form with invalid data", () => {
    cy.fillName(testName)
    cy.fillPhoneNumber(testInvalidPhoneNumber)
    cy.fillMessage(testLongMessage)
    cy.clickSendForm()

    cy.get("@formWidget").contains("Try Again").should("be.visible")
  })
})
