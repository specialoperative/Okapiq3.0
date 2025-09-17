import asyncio
from playwright.async_api import async_playwright

INDUSTRIES = [
  'HVAC','Plumbing','Electrical','Landscaping','Restaurant','Retail','Healthcare','Automotive',
  'Construction','Manufacturing','IT Services','Real Estate','Education','Entertainment','Transportation',
  'Accounting Firms','Security Guards','Fire and Safety'
]

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto('http://localhost:3000/oppy', timeout=60000)
        await page.wait_for_selector('select', timeout=15000)
        results = {}
        for ind in INDUSTRIES:
            # select industry
            try:
                await page.select_option('select', value=ind.lower())
            except Exception:
                # some select values contain spaces; fallback to selecting by visible text
                await page.click('select')
                await page.keyboard.type(ind)
                await page.keyboard.press('Enter')
            # set location
            await page.fill('input[placeholder*="Enter a city"], input[type="text"]', 'San Francisco')
            await page.click('button:has-text("Search")')
            # wait for results container
            try:
                await page.wait_for_selector('.rounded-xl.shadow-lg', timeout=20000)
            except Exception:
                pass
            # count result cards
            cards = await page.query_selector_all('div.rounded-xl.shadow-lg')
            cnt = len(cards)
            # check contact fields in first card
            contact_ok = False
            if cnt>0:
                card = cards[0]
                text = await card.inner_text()
                contact_ok = ('@' in text) or ('Phone' in text) or ('phone' in text.lower())
            results[ind] = {'cards': cnt, 'contact_found': contact_ok}
            print(f"Industry={ind} cards={cnt} contact={contact_ok}")
            await asyncio.sleep(1)
        await browser.close()
        return results

if __name__ == '__main__':
    r = asyncio.get_event_loop().run_until_complete(run_test())
    print(r)
