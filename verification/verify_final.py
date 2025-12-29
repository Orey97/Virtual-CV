import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # iPhone 12 Pro dimensions to verify mobile responsiveness
        page = browser.new_page(viewport={"width": 390, "height": 844})

        # Ensure we use the absolute path to the file
        file_path = f"file://{os.getcwd()}/index.html"
        page.goto(file_path)

        # Wait for canvas to initialize and animation to start
        page.wait_for_timeout(2000)

        # Take a screenshot of the hero section
        page.screenshot(path="verification/final_proof.png")

        print("Screenshot captured at verification/final_proof.png")
        browser.close()

if __name__ == "__main__":
    run()