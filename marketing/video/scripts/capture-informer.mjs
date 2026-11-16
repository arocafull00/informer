import { chromium } from "../../../node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 1.5,
});
await page.goto("http://localhost:3102/seed-ados2");
await page.waitForURL("http://localhost:3102/");
await page.evaluate(() => {
  const history = JSON.parse(localStorage.getItem("informer-history"));
  history.state.reports.forEach((r) => {
    r.patientName = "Caso de demostración";
    r.title = "Caso de demostración";
  });
  history.state.reports.forEach((r) => {
    Object.keys(r.answers).forEach((k) => {
      r.answers[k] = 0;
    });
    delete r.answers["ados2-nino-01"];
  });
  localStorage.setItem("informer-history", JSON.stringify(history));
});
await page.reload();
await page
  .getByRole("button")
  .filter({ hasText: "ADOS-2 Niño" })
  .first()
  .click();
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await page.waitForTimeout(1000);
await page.screenshot({ path: "public/informer-ui.png" });
const option = page.getByRole("button", {
  name: "0: Utiliza las frases de manera correcta.",
  exact: true,
});
const box = await option.boundingBox();
await fs.writeFile(
  ".promptible/click-target.json",
  JSON.stringify(box, null, 2),
);
await option.click();
await page.waitForTimeout(350);
await page.screenshot({ path: "public/informer-ui-after.png" });
const questions = JSON.parse(
  await fs.readFile("../../data/ados2-nino.json", "utf8"),
);
const evidence = await page.locator("body").innerText();
await fs.writeFile(".promptible/research-ui-text.txt", evidence);
await fs.writeFile(
  ".promptible/first-question.json",
  JSON.stringify(questions[0], null, 2),
);
console.log(evidence.slice(0, 9000));
await browser.close();
