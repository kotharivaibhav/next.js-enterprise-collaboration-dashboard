import { expect, test } from "@playwright/test";

test("health endpoint returns ok", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as { status: string; service: string };
  expect(body.status).toBe("ok");
  expect(body.service).toBe("collabforge-frontend");
});

test("home redirects to login or dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(login|dashboard)/);
});
