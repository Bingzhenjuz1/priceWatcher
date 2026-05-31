import { expect, test } from "@playwright/test";

test("searches product and creates a price watch", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("商品关键词或链接").fill("iPhone 16 256G");
  await page.getByRole("button", { name: "搜索" }).click();

  await expect(page.getByRole("heading", { name: "比价结果" })).toBeVisible();
  await expect(page.getByText("Apple iPhone 16").first()).toBeVisible();
  await expect(page.getByText(/可信度/).first()).toBeVisible();

  const createWatchResponse = page.waitForResponse(
    (response) => response.url().includes("/api/watches") && response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "监控目标价" }).first().click();
  await expect((await createWatchResponse).status()).toBe(201);
  await page.waitForURL(/\/watch\//);
  await expect(page.getByRole("heading", { name: "iPhone 16 256G", exact: true })).toBeVisible();
  await page.getByLabel("目标价").fill("5500");
  await page.getByLabel("启用监控").uncheck();
  await page.getByRole("button", { name: "保存设置" }).click();
  await expect(page.getByText("状态 已停用")).toBeVisible();
  await page.getByLabel("目标价").fill("6500");
  await page.getByLabel("启用监控").check();
  await page.getByRole("button", { name: "保存设置" }).click();
  await expect(page.getByText("状态 监控中")).toBeVisible();

  const refreshWatchResponse = page.waitForResponse(
    (response) => response.url().includes("/api/watches/") && response.url().includes("/refresh")
  );
  await page.getByRole("button", { name: "刷新价格" }).click();
  await expect((await refreshWatchResponse).status()).toBe(200);
  await expect(page.getByText("提醒记录")).toBeVisible();
  await expect(page.getByText(/触发/).first()).toBeVisible();

  await page.getByRole("link", { name: "提醒中心" }).click();
  await page.waitForURL(/\/alerts/);
  await expect(page.getByRole("heading", { name: "提醒中心" })).toBeVisible();
  await expect(page.getByText("未读").first()).toBeVisible();
  await page.getByRole("button", { name: "标记已读" }).first().click();
  await expect(page.getByText("已读").first()).toBeVisible();
});
