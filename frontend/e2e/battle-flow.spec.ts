import { expect, test } from "@playwright/test";

test.describe("Flujo torneo", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // IdentityGate: minimal session to see the roster (same localStorage as the app)
      localStorage.setItem("torneo-kiai-guest-id", "e2e-guest-001");
      localStorage.setItem("torneo-kiai-alias", "E2EUser");
      localStorage.setItem("torneo-kiai-oop-home-tour-seen", "1");
    });
  });

  test("selección → combate → fin", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("roster-item-goku")).toBeVisible({
      timeout: 60_000,
    });

    await page.getByTestId("pick-goku-A").click();
    await page.getByTestId("pick-vegeta-B").click();
    await page.getByTestId("start-battle").click();

    await expect(page).toHaveURL(/\/battle\/[a-f0-9]{24}/i, {
      timeout: 30_000,
    });

    const strong = page.getByTestId("action-attack-1");
    const basic = page.getByTestId("action-attack-0");
    const recharge = page.getByTestId("action-recharge");
    const finished = page.getByTestId("battle-finished");

    const waitAction = () =>
      page.waitForResponse(
        (r) =>
          r.url().includes("/battles/") &&
          r.url().includes("/action") &&
          r.request().method() === "POST" &&
          r.ok(),
        { timeout: 45_000 },
      );

    for (let i = 0; i < 280; i++) {
      if (await finished.isVisible().catch(() => false)) break;

      await page.waitForFunction(
        () => {
          if (document.querySelector('[data-testid="battle-finished"]'))
            return true;
          const root = document.querySelector('[data-testid="battle-actions"]');
          if (!root) return false;
          return Array.from(root.querySelectorAll("button")).some(
            (b) => !(b as HTMLButtonElement).disabled,
          );
        },
        { timeout: 60_000 },
      );

      if (await finished.isVisible().catch(() => false)) break;

      if ((await strong.isVisible()) && (await strong.isEnabled())) {
        await Promise.all([waitAction(), strong.click()]);
        continue;
      }
      if ((await basic.isVisible()) && (await basic.isEnabled())) {
        await Promise.all([waitAction(), basic.click()]);
        continue;
      }
      if ((await recharge.isVisible()) && (await recharge.isEnabled())) {
        await Promise.all([waitAction(), recharge.click()]);
        continue;
      }

      break;
    }

    await expect(finished).toBeVisible({ timeout: 30_000 });
  });
});
