import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { environmentFixture, climateFixture } from "./tanom-fixtures";

for (const width of [1440, 768, 390]) {
  test(`AI controls stay with their report at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/environment?*", (r) =>
      r.fulfill({
        json: {
          ...environmentFixture(),
          observedAt: "2026-11-01T00:00:00Z",
          hourlyConditions: Array.from({ length: 24 }, (_, i) => ({
            time: new Date(Date.UTC(2026, 10, 1, i)).toISOString(),
            temperature: 26 + (i % 4),
            rainfall: i % 3,
            soilMoisture: 0.3,
          })),
        },
      }),
    );
    await page.route("**/api/climate-profile?*", (r) =>
      r.fulfill({ json: climateFixture }),
    );
    await page.route("**/api/outlook?*", (r) =>
      r.fulfill({ json: climateFixture }),
    );
    let requests = 0;
    await page.route("**/api/analysis", async (r) => {
      requests++;
      await r.fulfill({
        json: {
          analysis: "A modeled weather summary.",
          model: "fixture",
          observedAt: "2026-11-01T00:00:00Z",
        },
      });
    });
    await page.goto("/dashboard");
    for (const route of [
      "dashboard",
      "conditions",
      "environment",
      "planning",
    ]) {
      await page.locator(`.page-nav a[href="/${route}"]`).click();
      const panel = page.locator(".dashboard-panel:not([hidden])");
      const insights = panel.locator(".analysis-panel");
      const toggle = insights.getByRole("switch", {
        name: "Enable AI insights",
        exact: true,
      });
      await expect(toggle).toBeVisible();
      await expect(insights.locator(".analysis-disclosure")).toContainText(
        "OpenRouter",
      );
      expect(
        await insights.evaluate(
          (el) => el === el.parentElement!.firstElementChild,
        ),
      ).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if (route === "dashboard") {
        expect(requests).toBe(0);
        await toggle.click();
      }
      await expect(insights.locator(".analysis-content")).toContainText(
        "A modeled weather summary.",
      );
      await expect(
        insights
          .getByRole("status")
          .filter({ hasText: "Waiting for report data" }),
      ).toHaveCount(0);
      await page.screenshot({
        path: `/tmp/tanom-layout/${route}-${width}.png`,
        fullPage: true,
      });
    }
    await page.getByRole("switch", { name: "Cebuano", exact: true }).click();
    await expect(
      page.getByRole("switch", {
        name: "I-enable ang AI insights",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .include(".analysis-panel")
      .analyze();
    expect(results.violations).toEqual([]);
    await page.locator('.page-nav a[href="/ml"]').click();
    await expect(page.getByRole("switch", { name: /AI insights/ })).toHaveCount(
      0,
    );
  });
}
