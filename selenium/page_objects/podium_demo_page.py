from page_objects.base_page import BasePage
from typing import TypedDict

BASE_URL = 'https://demo.podium.tools/qa-webchat-lorw/'


class PodiumDemoPage(BasePage):
    page_quote = 'h1'
    iframe_widget_closed = 'div#podium-website-widget iframe[data-cy="podium-website-widget-iframe"][id="podium-bubble"]'
    greeting_message_widget = 'div.Prompt__PromptText'
    close_prompt_button = 'button.Prompt__CloseButton'
    text_us_button = 'button[id="podium-website-widget-button"] span'
    close_widget = 'iframe[data-cy="podium-website-widget-iframe"][id="podium-bubble"]'  # ContactBubble__TextUs ContactBubble__TextUs--opened

    def __init__(self, driver):
        self.driver = driver['browser']
        self.open_page()
        self.is_page_loaded()

    def open_page(self):
        self.driver.get(BASE_URL)

    def is_page_loaded(self) -> bool:
        loaded_status = self.wait_element(self.page_quote, handle_error=True) and self.wait_element(self.iframe_widget_closed,
                                                                                                    handle_error=True)
        return True if loaded_status else False

    def read_page_quote(self) -> str:
        return self.read_text(self.page_quote)

    def __switch_to_iframe_widget(self):
        iframe = self.wait_element(self.iframe_widget_closed)
        self.driver.switch_to.frame(iframe)
        # WebDriverWait(self.driver, 10).until(
        #     EC.frame_to_be_available_and_switch_to_it((By.CSS_SELECTOR, self.iframe_widget_closed)), "iframe not found")

    def is_greeting_message_displayed(self):
        self.__switch_to_iframe_widget()
        greeting = self.wait_element(self.greeting_message_widget, handle_error=True)
        return True if greeting else False

    def open_form_widget(self):
        self.__switch_to_iframe_widget()
        self.click_element(self.text_us_button)
        return SelectLocationWidget(self.driver)

    def switch_to_default_content(self):
        self.driver.switch_to.default_content()

    def click_greeting_message(self):
        self.click_element(self.greeting_message_widget)

    def close_greeting_message(self):
        self.click_element(self.close_prompt_button)


class Location(TypedDict):
    location_name: str
    location_address: str


class SelectLocationWidget(BasePage):
    iframe_widget_opened = 'iframe[data-cy="podium-website-widget-iframe"][id="podium-modal"]'
    loading_spinner = 'span.StatusIcon > svg'
    search_input = 'input[id="search-input"]'
    reset_search_input_button = 'button[class="SearchInput__Reset"][aria-label="clear location field"]'
    location_selector_subtitle = 'h1.LocationSelector__Title'
    locations = 'button[id^="widget-location-item"]'
    location_name = 'p.LocationContainer__Name'
    location_address = 'div.LocationContainer__Address'

    def __init__(self, driver):
        self.driver = driver
        self.__switch_to_opened_iframe_widget()

    def __switch_to_opened_iframe_widget(self):
        self.driver.switch_to.default_content()
        iframe = self.wait_element(self.iframe_widget_opened, handle_error=True)
        self.driver.switch_to.frame(iframe)

    def is_location_selector_displayed(self) -> bool:
        location_selector_subtitle = self.wait_element(self.location_selector_subtitle, handle_error=True)
        return True if location_selector_subtitle else False

    def search_location(self, location: str):
        self.clear_search()
        self.write_text(location, self.search_input)
        self.__wait_for_search()

    def clear_search(self):
        self.click_element(self.reset_search_input_button)

    def __wait_for_search(self):
        if self.wait_elements_to_exist(self.loading_spinner):
            self.wait_element_disappear(self.loading_spinner)

    def read_available_locations(self) -> list[Location]:
        locations = self.wait_elements(self.locations, handle_error=True)
        if locations:
            locations_list = []
            for location in locations:
                loc = Location(
                    location_name=self.get_child_element_text(location, self.location_name),
                    location_address=self.get_child_element_text(location, self.location_address)
                )
                locations_list.append(loc)
            return locations_list
        else:
            raise Exception('Locations not available.')

    def click_location(self, location_name: str):
        locations = self.wait_elements(self.locations, handle_error=True)
        if locations:
            for location in locations:
                if self.get_child_element_text(location, self.location_name) == location_name:
                    self.click_element_object(location)
                    return SendFormWidget(self.driver)
        else:
            raise Exception('Location not found.')


class SendFormWidget(BasePage):
    intro_message = 'div.SendSmsPage__TextInvitation > div'
    selected_location_name = 'div.SendSmsPage__CurrentLocation h1'
    selected_location_address = 'div.SendSmsPage__CurrentLocationAddress h2'

    def __init__(self, driver):
        self.driver = driver

    def is_intro_message_displayed(self):
        intro_message = self.wait_element(self.intro_message, handle_error=True)
        return True if intro_message else False

    def read_select_location_name(self) -> str:
        selected_location_name = self.get_element(self.selected_location_name)
        return selected_location_name.text

    def read_selected_location_address(self) -> str:
        selected_location_address = self.get_element(self.selected_location_address)
        return selected_location_address.text
