import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { environmentFixture, climateFixture } from "./tanom-fixtures";
for (const width of [390, 768, 1440]) {
  test(`polish continuity at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/environment?*", (r) =>
      r.fulfill({ json: environmentFixture() }),
    );
    await page.route("**/api/climate-profile?*", (r) =>
      r.fulfill({ json: climateFixture }),
    );
    await page.route("**/api/outlook?*", (r) =>
      r.fulfill({ json: climateFixture }),
    );
    for (const ceb of [false, true]) {
      await page.goto("/");
      const language = page.getByRole("switch", { name: "Cebuano" });
      if ((await language.getAttribute("aria-checked")) !== String(ceb))
        await language.click();
      await expect(language.locator('[data-selected="true"]')).toHaveText(
        ceb ? "CEB" : "EN",
      );
      const destination = page.locator('.landing-header a[href="/dashboard"]');
      expect(
        await destination.evaluate((el) =>
          parseFloat(getComputedStyle(el).fontSize),
        ),
      ).toBeGreaterThanOrEqual(14);
      expect(await destination.innerText()).toContain(ceb ? "Ablihi" : "Open");
      await expect(page.locator(".landing-header .tanom-mark")).toBeVisible();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.screenshot({
        path: `test-results/polish-landing-${width}-${ceb ? "ceb" : "en"}.png`,
        fullPage: true,
      });
      await destination.click();
      await expect(language).toHaveAttribute("aria-checked", String(ceb));
      await expect(page.locator(".tanom-header .tanom-mark")).toBeVisible();
      await expect(page.locator(".leaflet-container")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `test-results/polish-dashboard-${width}-${ceb ? "ceb" : "en"}.png`,
        fullPage: true,
      });
    }
  });
}
