# Podium Demo Page Testing - Take Home Challenge

## Introduction

This project is part of the QA Take Home Challenge by Podium as an application requirement for the Software Engineer in Test position.

Even though I've been working with Selenium/Pytest/Page Object Model for a long time, I decided to not use it in this project, since it'd be a little overkill and require too much setup upfront. For that reason, I decided to go with [Cypress](https://docs.cypress.io/guides/overview/why-cypress) using [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands) - if needed to use POM, it should be an easy refactor.

_If you want to take a look, the unfinished project using **Selenium/Pytest/Page Object Model** is located inside the `selenium` folder. Base page objects missing, only demo page logic for it and two tests._

I definitely enjoyed working on this. If you have any questions, don't hesitate and please reach out to me on thiagomachadox@gmail.com.

## How to run (without Docker)

Clone this project, `cd` into its folder, run `npm i` to install the project dependencies.

Then, run `npm run cypress:open` to open Cypress and be able to run tests in interactive mode. If you would like to simply run the tests in headless mode, run `npm test`.

## How to run (with Docker)

Clone this project, `cd` into its folder, run `docker build -t podium-demo-take-home-challenge .`

This will build the Docker image and tag it with the name `podium-demo-take-home-challenge`.

Run the Docker container by running the following command:

```shell
docker run -it --rm -v $PWD:/app -e "DISPLAY=${DISPLAY}" -v /tmp/.X11-unix:/tmp/.X11-unix --privileged --device=/dev/snd podium-demo-take-home-challenge
```

This will start a new container using the `podium-demo-take-home-challenge` image, mount the current directory as a volume inside the container, and run the tests inside the container. The additional flags and arguments are for allowing Chrome to display in the container, which are explained below:

- -e "DISPLAY=${DISPLAY}" -v /tmp/.X11-unix:/tmp/.X11-unix --privileged --device=/dev/snd allows the container to access your X server, which is needed for Chrome to display.
- -it flag is for interactive mode.
- --rm flag is to remove the container after it exits.
  If you are on Windows, you can remove -v /tmp/.X11-unix:/tmp/.X11-unix --privileged --device=/dev/snd from the above command.

If everything is set up correctly, you should see the Cypress test runner start up inside the container.

## Bugs

- Back button does not work

  ```feature
   Feature: Selecting a location

   Scenario: User wants to change location after selecting the wrong one
   Given that I am on the demo page
   And I have clicked on the "text us" button
   And the location selection menu has appeared
   When I select a new location
   Then I should be directed to the form
   When I click the "back" button
   Then I should see the location selection menu again
  ```

- Form fields are not reset after closing widget

  ```feature
   Feature: Closing the widget

   Scenario: User closes widget after filling form fields and selects another location
   Given that I am on the demo page
   And I have clicked on the "text us" button
   And the location selection menu has appeared
   When I select a location
   Then I should be directed to the form
   When I fill the form values
   And I close the location selection menu
   Then the menu should disappear
   And the form fields should be reset
   When I click on the "text us" button again
   Then the location selection menu should appear
   When I select a new location
   Then the form fields should be empty
  ```
