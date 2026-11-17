import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { environmentFixture, climateFixture } from "./tanom-fixtures";
const luminance = (rgb: number[]) =>
  rgb
    .map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    })
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a: string, b: string) => {
  const l = [a, b].map((s) =>
    luminance(
      s
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number),
    ),
  );
  return (Math.max(...l) + 0.05) / (Math.min(...l) + 0.05);
};
for (const width of [390, 1440])
  test(`color semantics and states ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route("**/api/environment?*", (r) =>
      r.fulfill({
        json: {
          ...environmentFixture(),
          hourlyConditions: Array.from({ length: 168 }, (_, i) => ({
            time: new Date(Date.UTC(2026, 9, 31, 16 + i)).toISOString(),
            temperature: 24 + (i % 7),
            rainfall: i % 4,
            soilMoisture: 0.25 + (i % 5) * 0.01,
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
    const pairs: unknown[] = [];
    for (const ceb of [false, true]) {
      await page.goto("/");
      const lang = page.getByRole("switch", { name: "Cebuano" });
      if ((await lang.getAttribute("aria-checked")) !== String(ceb))
        await lang.click();
      await page.screenshot({
        path: `test-results/color-landing-${width}-${ceb}.png`,
        fullPage: true,
      });
      for (const path of ["/conditions", "/planning", "/environment"]) {
        await page.goto(path);
        await expect(page.locator(".leaflet-container")).toBeVisible();
        const failures = (
          await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze()
        ).violations;
        expect(failures).toEqual([]);
        const selected = page
          .locator(
            '.condition-tabs [aria-selected="true"]:visible,.season-tabs [aria-pressed="true"]:visible',
          )
          .first();
        if (await selected.count()) {
          const pair = await selected.evaluate((el) => ({
            color: getComputedStyle(el).color,
            bg: getComputedStyle(el).backgroundColor,
            border: getComputedStyle(el).borderColor,
          }));
          expect(ratio(pair.color, pair.bg)).toBeGreaterThanOrEqual(4.5);
          pairs.push({ path, ...pair, ratio: ratio(pair.color, pair.bg) });
          await selected.hover();
          const hover = await selected.evaluate((el) => ({
            color: getComputedStyle(el).color,
            bg: getComputedStyle(el).backgroundColor,
          }));
          expect(ratio(hover.color, hover.bg)).toBeGreaterThanOrEqual(4.5);
          await page.keyboard.press("Tab");
          await selected.focus();
          const focus = await selected.evaluate((el) => ({
            outline: getComputedStyle(el).outlineColor,
            width: parseFloat(getComputedStyle(el).outlineWidth),
            panel: getComputedStyle(document.documentElement)
              .getPropertyValue("--tanom-panel")
              .trim(),
          }));
          const panelRGB = await page.evaluate((color) => {
            const e = document.createElement("span");
            e.style.color = color;
            document.body.append(e);
            const rgb = getComputedStyle(e).color;
            e.remove();
            return rgb;
          }, focus.panel);
          expect(focus.width).toBeGreaterThanOrEqual(3);
          expect(ratio(focus.outline, panelRGB)).toBeGreaterThanOrEqual(3);
          pairs.push(
            {
              path,
              state: "hover",
              ...hover,
              ratio: ratio(hover.color, hover.bg),
            },
            {
              path,
              state: "focus",
              ...focus,
              ratio: ratio(focus.outline, panelRGB),
            },
          );
        }
        await page.screenshot({
          path: `test-results/color-${path.slice(1)}-${width}-${ceb}.png`,
          fullPage: true,
        });
      }
    }
    await page.unroute("**/api/environment?*");
    await page.route("**/api/environment?*", async (r) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await r.fulfill({
        status: 502,
        json: { error: "Weather provider unavailable" },
      });
    });
    await page.goto("/conditions");
    await expect(page.locator('.status-note[role="status"]')).toBeVisible();
    await page.screenshot({
      path: `test-results/color-loading-${width}.png`,
      fullPage: true,
    });
    const alert = page.locator(".error-note");
    await expect(alert).toBeVisible();
    const errorPair = await alert.evaluate((el) => ({
      color: getComputedStyle(el).color,
      bg: getComputedStyle(el).backgroundColor,
    }));
    expect(ratio(errorPair.color, errorPair.bg)).toBeGreaterThanOrEqual(4.5);
    pairs.push({
      state: "error",
      ...errorPair,
      ratio: ratio(errorPair.color, errorPair.bg),
    });
    await page.screenshot({
      path: `test-results/color-error-${width}.png`,
      fullPage: true,
    });
    await test.info().attach("computed-color-pairs", {
      body: JSON.stringify(pairs, null, 2),
      contentType: "application/json",
    });
  });
