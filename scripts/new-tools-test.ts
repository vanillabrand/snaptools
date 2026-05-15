import { runTest } from "./auth";

runTest("New Tools Test", async (helper) => {
  const { page } = helper;

  // Check homepage shows all 20 tools
  await helper.goto("/");
  await page.waitForSelector("text=Free Online Tools");

  // Count tool cards
  const toolCards = await page.locator("a[href^='/tools/']").count();
  console.log(`Found ${toolCards} tool cards on homepage`);
  if (toolCards < 20) {
    throw new Error(`Expected at least 20 tools, found ${toolCards}`);
  }

  // Test Image Resizer
  await helper.goto("/tools/image-resizer");
  await page.waitForSelector("text=Image Resizer");
  await page.waitForSelector("text=Drop an image here");
  console.log("✅ Image Resizer loaded");

  // Test Instagram Font Generator
  await helper.goto("/tools/instagram-fonts");
  await page.waitForSelector("text=Instagram Font Generator");
  await page.waitForSelector("text=Type your text here");
  // Check multiple font outputs render
  const fontCards = await page.locator("button:has-text('Bold')").count();
  if (fontCards < 1) throw new Error("Font outputs not rendering");
  console.log("✅ Instagram Font Generator loaded");

  // Test Mortgage Calculator
  await helper.goto("/tools/mortgage-calculator");
  await page.waitForSelector("text=Mortgage Calculator");
  await page.waitForSelector("text=Monthly Repayment");
  console.log("✅ Mortgage Calculator loaded");

  // Test Invoice Generator
  await helper.goto("/tools/invoice-generator");
  await page.waitForSelector("text=Invoice Generator");
  await page.waitForSelector("text=Invoice Details");
  await page.waitForSelector("text=Line Items");
  // Switch to preview
  await page.locator("button:has-text('Preview')").click();
  await page.waitForSelector("text=INVOICE");
  console.log("✅ Invoice Generator loaded with preview");

  // Test Colour Palette Generator
  await helper.goto("/tools/colour-palette");
  await page.waitForSelector("text=Colour Palette Generator");
  await page.waitForSelector("text=Generate New Palette");
  console.log("✅ Colour Palette Generator loaded");

  console.log("🎉 All new tools pass!");
}).catch(() => process.exit(1));
