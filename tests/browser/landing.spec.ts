import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("landing explains separate tools and persists language", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "For what you grow",
  );
  await expect(page.locator("a.tool-preview")).toHaveCount(3);
  await expect(page.locator(".leaflet-container")).toHaveCount(0);
  await page.screenshot({path:"test-results/landing-desktop.png",fullPage:true});
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("switch", { name: "Cebuano" }).click();
  await page.locator('.landing-actions a[href="/dashboard"]').click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("switch", { name: "Cebuano" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});
test("landing fits mobile", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.screenshot({path:"test-results/landing-mobile.png",fullPage:true});
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
