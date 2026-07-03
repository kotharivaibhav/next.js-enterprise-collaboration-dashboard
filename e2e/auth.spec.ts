import { expect, test } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("renders login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("shows validation errors for empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
  });
});

test.describe("Authenticated flows", () => {
  test.skip(
    !process.env.E2E_USER_EMAIL || !process.env.E2E_USER_PASSWORD,
    "Set E2E_USER_EMAIL and E2E_USER_PASSWORD to run authenticated E2E tests",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL!);
    await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("loads dashboard analytics", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("Workspaces")).toBeVisible();
  });

  test("opens command palette with keyboard shortcut", async ({ page }) => {
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+KeyK" : "Control+KeyK");
    await expect(page.getByPlaceholder(/Search workspaces/i)).toBeVisible();
  });

  test("navigates to workspaces", async ({ page }) => {
    await page.getByRole("link", { name: "Workspaces" }).click();
    await expect(page).toHaveURL(/\/workspaces/);
  });
});
