import { expect, test } from "@playwright/test";

test("signs in and completes the issue workflow", async ({ page }) => {
  const suffix = Date.now().toString();
  const organizationName = `Browser Org ${suffix}`;
  const projectName = `Browser Project ${suffix}`;
  const issueTitle = `Browser issue ${suffix}`;
  const updatedIssueTitle = `${issueTitle} updated`;
  const comment = `Browser comment ${suffix}`;

  await page.goto("/auth/sign-in");
  await page.getByLabel("Email address").fill(
    process.env.E2E_EMAIL ?? "ada@example.test",
  );
  await page.getByLabel("Password").fill(
    process.env.E2E_PASSWORD ?? "local-test-password",
  );
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);

  await page.getByLabel("Organization name").fill(organizationName);
  await page.getByRole("button", { name: "Create organization" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/app/${organizationName.toLowerCase().replaceAll(" ", "-")}/projects$`),
  );

  await page.getByLabel("Project name").fill(projectName);
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page.getByRole("link", { name: projectName })).toBeVisible();
  const projectHref = await page.getByRole("link", { name: projectName }).getAttribute("href");
  if (!projectHref) {
    throw new Error("Created project link did not expose a project URL.");
  }
  await page.getByRole("link", { name: projectName }).click();

  await page.getByLabel("Title", { exact: true }).fill(issueTitle);
  await page.getByLabel("Description").fill("Created by the browser smoke test.");
  await page.getByRole("button", { name: "Create issue" }).click();
  await expect(page.getByRole("link", { name: issueTitle })).toBeVisible();
  await page.getByRole("link", { name: issueTitle }).click();

  await page.getByLabel("Title", { exact: true }).fill(updatedIssueTitle);
  await page.getByRole("button", { name: "Save issue" }).click();
  await expect(page.getByText("Issue updated.")).toBeVisible({ timeout: 15_000 });

  await page.getByLabel("Add a comment").fill(comment);
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.getByText(comment)).toBeVisible();

  await page.goto(`${projectHref}?status=open&q=Browser+issue`);
  await expect(page.getByRole("link", { name: issueTitle })).toBeVisible();
});
