import pytest
from assertpy import assert_that

from page_objects.demo_podium_page import PodiumDemoPage
from tests_web.test_base import TestBase
from utils.testdata import PAGE_TITLE, AVAILABLE_LOCATIONS


@pytest.mark.ui
class TestPodiumDemoPage(TestBase):

    def test_open_widget(self, driver):
        podium_demo_page = PodiumDemoPage(driver)
        assert_that(podium_demo_page.is_page_loaded()).is_true()
        assert_that(podium_demo_page.read_page_quote()).is_equal_to(PAGE_TITLE)
        assert_that(podium_demo_page.is_greeting_message_displayed()).is_true()
        select_location_widget = podium_demo_page.open_form_widget()
        assert_that(select_location_widget.is_location_selector_displayed()).is_true()

    def test_search_location(self, driver):
        test_location = 'New York'

        podium_demo_page = PodiumDemoPage(driver)
        assert_that(podium_demo_page.is_page_loaded()).is_true()
        assert_that(podium_demo_page.read_page_quote()).is_equal_to(PAGE_TITLE)

        select_location_widget = podium_demo_page.open_form_widget()
        assert_that(select_location_widget.is_location_selector_displayed()).is_true()
        select_location_widget.search_location(test_location)
        # since there are only 3 locations available, assert they're present instead of verifying for searched value
        assert_that(
            sorted(select_location_widget.read_available_locations(), key=lambda d: d['location_name'])).is_equal_to(
            sorted(AVAILABLE_LOCATIONS, key=lambda d: d['location_name']))

        send_form_widget = select_location_widget.click_location(AVAILABLE_LOCATIONS[0]['location_name'])
        assert_that(send_form_widget.is_intro_message_displayed()).is_true()
        assert_that(send_form_widget.read_select_location_name()).is_equal_to(AVAILABLE_LOCATIONS[0]['location_name'])
        assert_that(send_form_widget.read_selected_location_address()).is_equal_to(
            AVAILABLE_LOCATIONS[0]['location_address'])
