import { expect, test } from "@playwright/test";

test("creates, updates, exports, and reloads a Vibe Repo", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByLabel("Title").fill("Demo Repo");
  await page.getByLabel("One-line vibe").fill("A tiny Vibe Repo");
  await page.getByLabel("Current idea").fill("Create and export a VibeLog.");
  await page.getByRole("button", { name: "Create Vibe Repo" }).click();

  await expect(page.getByRole("button", { name: "Demo Repo" })).toBeVisible();
  await page.getByRole("button", { name: "Demo Repo" }).click();

  const detail = page.getByRole("region", { name: "Vibe Repo detail" });
  await expect(detail.getByRole("heading", { name: "Demo Repo" })).toBeVisible();
  await expect(detail.locator(".detail-header p:not(.eyebrow)")).toHaveText("Create and export a VibeLog.");

  await page.getByLabel("Update summary").fill("Added update flow.");
  await page.getByLabel("Updated idea").fill("Create, update, and export a VibeLog.");
  await page.getByLabel("Next action").fill("Keep the slice small.");
  await page.getByRole("button", { name: "Append Update" }).click();

  const progress = page.getByRole("region", { name: "Vibe progress" });
  await expect(progress.locator("article strong")).toHaveText("Added update flow.");
  await page.getByRole("button", { name: "Markdown" }).click();
  await expect(page.getByTestId("export-preview")).toContainText("## One-Line Vibe");
  await expect(page.getByTestId("export-preview")).toContainText("Added update flow.");

  await page.getByRole("button", { name: "JSON" }).click();
  const jsonText = await page.getByTestId("export-preview").innerText();
  expect(JSON.parse(jsonText).title).toBe("Demo Repo");

  await page.reload();
  await expect(page.getByRole("button", { name: "Demo Repo" })).toBeVisible();
});
