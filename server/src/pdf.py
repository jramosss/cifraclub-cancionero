from playwright.async_api import async_playwright

async def html_to_pdf(html: str, pdf_path: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.set_content(html)
        await page.pdf(path=pdf_path)
        await browser.close()
