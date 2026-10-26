import { chromium } from "playwright";
const out = process.argv[2];
const step = process.argv[3] ?? "explore";
const base = "http://localhost:3200";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await page.goto(`${base}/seed-ados2`);
await page.waitForURL(`${base}/`);
await page.evaluate(() => {
  const h = JSON.parse(localStorage.getItem("informer-history"));
  const [adulto, nino] = h.state.reports;
  Object.assign(nino, { groupId: "g-lucas", patientName: "Lucas Martín Soler", patientSex: "M", title: undefined });
  Object.assign(adulto, { groupId: "g-lucia", patientName: "Lucía Ferrer Gil", patientSex: "F", title: undefined });
  h.state.groups = [
    { id: "g-lucas", name: "Lucas Martín Soler", collapsed: false },
    { id: "g-lucia", name: "Lucía Ferrer Gil", collapsed: false },
  ];
  localStorage.setItem("informer-history", JSON.stringify(h));
});
await page.reload();
await page.waitForTimeout(1500);
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await page.locator("button", { hasText: "ADOS-2 Niño" }).filter({ hasText: "Lucas Martín Soler" }).first().click();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/informer-1-codificacion.png` });

await page.getByRole("button", { name: "Generar ADOS-2" }).click();
await page.waitForTimeout(1500);
await page.getByRole("dialog").locator("input").first().fill("Lucas Martín Soler");
const [download] = await Promise.all([
  page.waitForEvent("download"),
  page.getByRole("button", { name: "Descargar resultado" }).click(),
]);
await download.saveAs(`${out}/informer-resultado.pdf`);
const { pdf } = await import("pdf-to-img");
let n = 0;
for await (const img of await pdf(`${out}/informer-resultado.pdf`, { scale: 2.5 })) {
  n++;
  const { writeFile } = await import("node:fs/promises");
  await writeFile(`${out}/informer-2-pdf-p${n}.png`, img);
}
console.log("pdf pages", n);

if (step === "explore") {
  const texts = await page.locator("button").allInnerTexts();
  console.log(texts.filter((t) => t && !/^[0-9]+\s/.test(t)));
}
await browser.close();
