import playwright from 'playwright';
import products from './products.js';

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  const amazonItems = products.amazon.items;

  for (let x = 0; x < amazonItems.length; x++) {
    await page.goto(amazonItems[x].url);

    const inStock = await page.$(products.amazon.selector);

    console.log('Item: ' + amazonItems[x].name);
    console.log(inStock ? 'In stock' : 'Out of stock');
    console.log('');
  }

  await browser.close();
})();
