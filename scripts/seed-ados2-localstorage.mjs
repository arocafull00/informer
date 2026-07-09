import { chromium } from "playwright";

const baseUrl = process.env.SEED_URL ?? "http://localhost:3000";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`${baseUrl}/seed-ados2`, { waitUntil: "domcontentloaded" });
await page.waitForURL(`${baseUrl}/`);

const counts = await page.evaluate(() => {
  const current = JSON.parse(localStorage.getItem("informer-current-report") ?? "{}");
  const saved = JSON.parse(localStorage.getItem("informer-history") ?? "{}");
  return {
    adulto: Object.keys(current.state?.answersByTest?.ADOS2_ADULTO ?? {}).length,
    nino: Object.keys(current.state?.answersByTest?.ADOS2_NINO ?? {}).length,
    history: saved.state?.reports?.length ?? 0,
  };
});

await browser.close();

console.log(
  `Seeded localStorage at ${baseUrl}: ADOS2 adulto ${counts.adulto} answers, ADOS2 niño ${counts.nino} answers, ${counts.history} saved reports`,
);
