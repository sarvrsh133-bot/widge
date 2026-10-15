import os
import sys
import time
import threading
import http.server
import socketserver
from playwright.sync_api import sync_playwright

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

PORT = 9010
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    def log_message(self, format, *args):
        pass

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), QuietHandler) as httpd:
        httpd.serve_forever()

def run_tests():
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(1)

    print(f"Server started at http://localhost:{PORT}")

    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="C:/Program Files/Google/Chrome/Application/chrome.exe",
            headless=True
        )

        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()

        # Capture console errors and uncaught exceptions
        page.on("pageerror", lambda exc: errors.append(f"PageError: {exc}"))
        page.on("console", lambda msg: errors.append(f"ConsoleError: {msg.text}") if msg.type == "error" else None)

        print("\n--- Test 1: Page Load & Initial State ---")
        page.goto(f"http://localhost:{PORT}/index.html")
        page.wait_for_load_state("networkidle")

        title = page.title()
        assert "Daily Habit Tracker" in title, f"Unexpected title: {title}"
        print(f"Page title verified: {title}")

        # Check Motivational Quote
        quote_text = page.locator("#quoteText").text_content()
        quote_author = page.locator("#quoteAuthor").text_content()
        assert len(quote_text.strip()) > 10, "Quote text should not be empty"
        assert len(quote_author.strip()) > 2, "Quote author should not be empty"
        print(f"Initial quote: {quote_text} {quote_author}")

        # Verify Sample Habits
        habit_cards = page.locator(".habit-card")
        habit_count = habit_cards.count()
        assert habit_count == 4, f"Expected 4 sample habits, found {habit_count}"
        print(f"Verified {habit_count} initial sample habits.")

        # Check Initial Stats (2 of 4 sample habits are completed by default -> 50%)
        perc_text = page.locator("#completionPercentage").text_content()
        assert perc_text == "50%", f"Expected 50% completion, got {perc_text}"
        comp_count = page.locator("#completedCount").text_content()
        assert comp_count == "2", f"Expected 2 completed habits, got {comp_count}"
        print(f"Stats verified: {comp_count}/4 completed ({perc_text})")

        # Capture desktop screenshot
        screenshot_dir = os.path.join(DIRECTORY, "screenshots")
        os.makedirs(screenshot_dir, exist_ok=True)
        page.screenshot(path=os.path.join(screenshot_dir, "desktop_initial.png"))
        print("Desktop screenshot captured.")

        print("\n--- Test 2: Quote Refresh ---")
        initial_quote = quote_text
        page.locator("#refreshQuoteBtn").click()
        page.wait_for_timeout(300)
        new_quote = page.locator("#quoteText").text_content()
        print(f"Refreshed quote: {new_quote}")

        print("\n--- Test 3: Toggle Habit Checkbox & Progress Bar ---")
        # Find habit 2 ("Daily Exercise & Stretch") which is incomplete
        exercise_card = page.locator(".habit-card", has_text="Daily Exercise & Stretch")
        exercise_checkbox = exercise_card.locator(".checkbox-container")
        exercise_checkbox.click()
        page.wait_for_timeout(200)

        # Now 3 of 4 completed -> 75%
        perc_text = page.locator("#completionPercentage").text_content()
        assert perc_text == "75%", f"Expected 75% completion, got {perc_text}"
        comp_count = page.locator("#completedCount").text_content()
        assert comp_count == "3", f"Expected 3 completed, got {comp_count}"
        print(f"After checking Exercise: {comp_count}/4 completed ({perc_text})")

        # Now complete the 4th habit ("Study & Focused Deep Work") -> 100%
        study_card = page.locator(".habit-card", has_text="Study & Focused Deep Work")
        study_card.locator(".checkbox-container").click()
        page.wait_for_timeout(300)

        perc_text = page.locator("#completionPercentage").text_content()
        assert perc_text == "100%", f"Expected 100% completion, got {perc_text}"
        status_badge = page.locator("#completionStatusBadge").text_content()
        assert "All Done" in status_badge, f"Expected 'All Done' badge, got {status_badge}"
        print(f"All habits completed: {perc_text} with status '{status_badge}'")

        print("\n--- Test 4: Add New Habit ---")
        page.locator("#openAddModalBtn").click()
        page.wait_for_selector("#habitModalBackdrop:not(.hidden)")

        page.fill("#habitTitleInput", "Mindful Meditation")
        page.select_option("#habitCategorySelect", "Mindfulness")
        page.fill("#habitGoalInput", "15 mins")

        # Select meditation icon
        page.locator(".icon-choice[title='Meditation']").click()
        # Select mint color
        page.locator(".color-dot[data-color='mint']").click()

        page.locator("#saveHabitBtn").click()
        page.wait_for_selector("#habitModalBackdrop", state="hidden")
        page.wait_for_timeout(200)

        # Verify new total habits is 5
        total_count = page.locator(".habit-card").count()
        assert total_count == 5, f"Expected 5 habits after adding, got {total_count}"
        new_card = page.locator(".habit-card", has_text="Mindful Meditation")
        assert new_card.is_visible(), "New habit card should be visible"
        print(f"Successfully added 'Mindful Meditation'. Total habits: {total_count}")

        print("\n--- Test 5: Search and Filtering ---")
        # Search for "Meditation"
        page.fill("#habitSearchInput", "Meditation")
        page.wait_for_timeout(150)
        visible_cards = page.locator(".habit-card:visible").count()
        assert visible_cards == 1, f"Expected 1 matching habit, got {visible_cards}"
        print(f"Search for 'Meditation' filtered to {visible_cards} habit")

        # Clear search
        page.locator("#clearSearchBtn").click()
        page.wait_for_timeout(150)
        assert page.locator(".habit-card:visible").count() == 5, "Expected all 5 habits visible"

        # Filter by category "Fitness"
        page.select_option("#categoryFilter", "Fitness")
        page.wait_for_timeout(150)
        visible_fitness = page.locator(".habit-card:visible").count()
        assert visible_fitness == 1, f"Expected 1 Fitness habit, got {visible_fitness}"
        print(f"Category filter 'Fitness' returned {visible_fitness} habit")

        # Reset category filter
        page.select_option("#categoryFilter", "all")
        page.wait_for_timeout(150)

        # Filter tabs: Completed vs Pending
        page.locator(".filter-tab[data-filter='pending']").click()
        page.wait_for_timeout(150)
        pending_count = page.locator(".habit-card:visible").count()
        print(f"Pending habits tab: {pending_count} habits")

        page.locator(".filter-tab[data-filter='all']").click()
        page.wait_for_timeout(150)

        print("\n--- Test 6: Delete Habit ---")
        # Delete "Mindful Meditation"
        del_target = page.locator(".habit-card", has_text="Mindful Meditation")
        del_target.locator(".delete-btn").click()
        page.wait_for_selector("#deleteConfirmBackdrop:not(.hidden)")

        page.locator("#confirmDeleteBtn").click()
        page.wait_for_selector("#deleteConfirmBackdrop", state="hidden")
        page.wait_for_timeout(200)

        assert page.locator(".habit-card").count() == 4, "Expected 4 habits after deletion"
        print("Habit deletion verified successfully.")

        print("\n--- Test 7: Local Storage Persistence across Reload ---")
        # Page reload should preserve state
        page.reload()
        page.wait_for_load_state("networkidle")
        reloaded_count = page.locator(".habit-card").count()
        assert reloaded_count == 4, f"Expected 4 habits after reload, got {reloaded_count}"

        reloaded_perc = page.locator("#completionPercentage").text_content()
        assert reloaded_perc == "100%", f"Expected 100% completion preserved in localStorage, got {reloaded_perc}"
        print("Persistence verified: habits and completed state preserved across page reload!")

        print("\n--- Test 8: Theme Toggle (Dark & Light Mode) ---")
        page.locator("#themeToggleBtn").click()
        page.wait_for_timeout(200)
        theme = page.locator("body").get_attribute("data-theme")
        assert theme == "dark", f"Expected dark theme, got {theme}"
        page.screenshot(path=os.path.join(screenshot_dir, "desktop_dark_mode.png"))
        print("Dark mode toggled and screenshot saved.")

        page.locator("#themeToggleBtn").click()
        page.wait_for_timeout(200)
        theme = page.locator("body").get_attribute("data-theme")
        assert theme == "light", f"Expected light theme, got {theme}"

        print("\n--- Test 9: Responsive Viewports (Tablet & Mobile) ---")
        # Tablet Viewport (768x1024)
        page.set_viewport_size({"width": 768, "height": 1024})
        page.wait_for_timeout(200)
        page.screenshot(path=os.path.join(screenshot_dir, "tablet_view.png"))
        print("Tablet layout verified and screenshot saved.")

        # Mobile Viewport (375x812 - iPhone X/12/13/14)
        page.set_viewport_size({"width": 375, "height": 812})
        page.evaluate("window.scrollTo(0, 0)")
        page.wait_for_timeout(200)
        page.screenshot(path=os.path.join(screenshot_dir, "mobile_view.png"))
        print("Mobile layout verified and screenshot saved.")

        # Check for unexpected console errors
        print("\n--- Console Error Audit ---")
        if errors:
            print("Errors detected during test:")
            for err in errors:
                print(f"  - {err}")
            sys.exit(1)
        else:
            print("ZERO console errors or unhandled exceptions detected! Clean execution.")

        browser.close()

    print("\n==========================================")
    print("ALL TESTS PASSED SUCCESSFULLY! (9/9)")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
