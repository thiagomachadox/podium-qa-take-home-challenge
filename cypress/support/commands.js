// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("getTextUsWidget", () => {
  cy.get('iframe[data-cy="podium-website-widget-iframe"][id="podium-bubble"]')
    .its("0.contentDocument.body")
    .should("be.visible")
    .and("not.be.empty")
    .should("contain", "Text us")
    .then(cy.wrap)
    .as("textUsWidget")
})

Cypress.Commands.add("getGreetingMessageWidget", () => {
  cy.get('iframe[data-cy="podium-website-widget-iframe"][id="podium-prompt"]')
    .its("0.contentDocument.body")
    .should("be.visible")
    .and("not.be.empty")
    .should("contain", "greeting")
    .then(cy.wrap)
    .as("greetingMessageWidget")
})

Cypress.Commands.add("getLocationSelectorWidget", () => {
  cy.get('iframe[data-cy="podium-website-widget-iframe"][id="podium-modal"]')
    .its("0.contentDocument.body")
    .should("be.visible")
    .and("not.be.empty")
    .should("contain", "Select Location")
    .then(cy.wrap)
    .as("locationWidget")
})

Cypress.Commands.add("loadClosedWidgetIframes", () => {
  cy.getTextUsWidget()
  cy.getGreetingMessageWidget()
})

Cypress.Commands.add("loadOpenWidgetIframe", () => {
  cy.get("@textUsWidget").contains("Text us").click()
  cy.getLocationSelectorWidget()
})

Cypress.Commands.add("loadSMSFormWidget", () => {
  // reassigning for better readability in tests
  cy.get("@locationWidget").then(cy.wrap).as("formWidget")
})

Cypress.Commands.add("clickCloseGreetingMessage", () => {
  cy.get("@greetingMessageWidget").contains("close").click()
})

Cypress.Commands.add("clickGreetingMessage", () => {
  cy.get("@greetingMessageWidget").find("div.Prompt__MessageBubble").click()
})

Cypress.Commands.add("clickTextUs", () => {
  cy.get("@textUsWidget").contains("Text us").click()
})

Cypress.Commands.add("searchLocation", (locationName) => {
  cy.get("@locationWidget").find("button.SearchInput__Reset").click()
  cy.get("@locationWidget").find("#search-input").type(locationName)
})

Cypress.Commands.add("locationSearchResults", () => {
  // wait for loading spinner
  cy.get("@locationWidget")
    .find("div.LocationsList__LoaderContainer", { timeout: 5_000 })
    .should("not.exist")
  cy.get("@locationWidget").find("button[id^='widget-location-item']")
})

Cypress.Commands.add(
  "selectLocation",
  (locationName = "Scoreboard Sports - Bountiful") => {
    cy.get("@locationWidget")
      .locationSearchResults()
      .find("p.LocationContainer__Name")
      .filter((_, el) => el.textContent === locationName)
      .first()
      .click()
  }
)

Cypress.Commands.add("getSelectedLocationName", () => {
  cy.get("@formWidget")
    .should("exist")
    .find("div.SendSmsPage__CurrentLocationName h1")
    .then(($el) => {
      return $el.text()
    })
})

Cypress.Commands.add("getLegalAdviceMessage", () => {
  return cy.get("@locationWidget").find("#ComposeMessage p.Legal__text")
})

Cypress.Commands.add("backToSelectLocation", () => {
  cy.get("@formWidget").find("[aria-label=back]").click()
})

Cypress.Commands.add("getNameField", () => {
  return cy.get("@formWidget").find("div.TextInput > input#Name")
})

Cypress.Commands.add("fillName", (name) => {
  cy.getNameField().clear().type(name).should("have.value", name)
})

Cypress.Commands.add("getPhoneField", () => {
  return cy.get("@formWidget").find("div.TextInput--tel > input")
})

Cypress.Commands.add("fillPhoneNumber", (phoneNumber) => {
  const formattedPhoneNumber = (text) => {
    return String(text)
      .trim()
      .replace(/[\s-]+/g, "")
  }

  cy.getPhoneField()
    .type(phoneNumber)
    .then(() => {
      expect(phoneNumber).to.be.equal(formattedPhoneNumber(phoneNumber))
    })
})

Cypress.Commands.add("getMessageField", () => {
  return cy.get("@formWidget").find("div.TextInput--message > textarea")
})

Cypress.Commands.add("fillMessage", (message) => {
  cy.getMessageField().type(message).should("have.value", message)
})

Cypress.Commands.add("getSendButton", () => {
  return cy.get("@formWidget").contains("Send")
})

Cypress.Commands.add("clickSendForm", () => {
  cy.getSendButton().click()
})

Cypress.Commands.add("clickCloseWidget", () => {
  cy.get("@textUsWidget")
    .find("button[aria-label='Select to close the chat widget']")
    .click()
})
