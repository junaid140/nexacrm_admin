import { test, expect } from "@playwright/test";
async function setup(page, handle, role = "Admin") {
  await page.addInitScript(() =>
    sessionStorage.setItem("saas-crm-api-token", "a".repeat(64)),
  );
  await page.route("**/api/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    const key = url.pathname.replace("/api/saas/", "");
    const answer = await handle(key, request);
    const data =
      answer ??
      (key === "me"
        ? {
            id: "owner",
            name: "Test Owner",
            email: "owner@example.com",
            role,
            isOwner: role === "Admin",
          }
        : key === "options"
          ? { clients: [], plans: [], subscriptions: [], industries: [] }
          : null);
    await route.fulfill({
      status: data?.httpStatus || 200,
      json: data?.httpStatus
        ? { success: false, message: data.message }
        : { success: true, data },
    });
  });
}
test("contact save persists after reload and pending form rejects duplicate submits", async ({
  page,
}) => {
  let values = { whatsappNumber: "+923001234567", callingNumber: "+924211234567" },
    writes = 0,
    release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  await setup(page, async (key, req) => {
    if (key !== "contact-settings") return;
    if (req.method() === "PUT") {
      writes++;
      await pending;
      values = req.postDataJSON();
    }
    return values;
  });
  await page.goto("/contact-settings");
  await page.getByLabel("WhatsApp contact number").fill("+923009876543");
  await page.getByRole("button", { name: "Save contact details" }).click();
  await expect(page.getByRole("button", { name: "Save contact details" })).toBeDisabled();
  await page.locator("form").evaluate((form) => {
    form.requestSubmit();
    form.requestSubmit();
  });
  await page.waitForTimeout(150);
  release();
  await expect(page.getByRole("status")).toHaveText("Contact details saved.");
  expect(writes).toBe(1);
  await page.reload();
  await expect(page.getByLabel("WhatsApp contact number")).toHaveValue("+923009876543");
  await expect(page.locator('[data-icon="whatsapp"]')).toBeVisible();
});
test("bank save preserves details on API failure and retries successfully", async ({
  page,
}) => {
  let fail = true,
    body;
  await setup(page, (key, req) => {
    if (key !== "payment-settings") return;
    if (req.method() === "PUT") {
      body = req.postDataJSON();
      if (fail) return { httpStatus: 503, message: "Bank service unavailable" };
      return body;
    }
    return {
      bankName: "Test Bank",
      accountTitle: "NexaCRM",
      accountNumber: "00123456789",
      iban: "",
      instructions: "",
      enabled: true,
    };
  });
  await page.goto("/payment-settings");
  await page.getByLabel("Account number", { exact: true }).fill("00000987654");
  await page.getByRole("button", { name: "Save bank details" }).click();
  await expect(page.getByRole("alert")).toContainText("Bank service unavailable");
  await expect(page.getByLabel("Account number", { exact: true })).toHaveValue(
    "00000987654",
  );
  fail = false;
  await page.getByRole("button", { name: "Save bank details" }).click();
  await expect(page.getByRole("status")).toContainText("Bank details saved");
  expect(body.accountNumber).toBe("00000987654");
  expect(body.enabled).toBe(true);
});
test("trial review validates reason, retains failed decision and traps/restores keyboard focus", async ({
  page,
}) => {
  let fail = true,
    writes = 0;
  const row = {
    id: "111111111111111111111111",
    fullName: "Trial Owner",
    email: "trial@example.com",
    phone: "+923001234567",
    companyName: "Trial Company",
    industry: "Property",
    teamSize: 5,
    city: "Lahore",
    status: "pending",
    createdAt: "2026-10-26T00:00:00Z",
  };
  await setup(page, (key, req) => {
    if (key.startsWith("trial-applications/") && req.method() === "POST") {
      writes++;
      return fail
        ? { httpStatus: 409, message: "Review conflict" }
        : { ...row, status: "approved" };
    }
    if (key === "trial-applications") return { docs: [row], count: 1, pages: 1 };
  });
  await page.goto("/trial-applications");
  const trigger = page.getByRole("button", { name: "View details" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(
    true,
  );
  await dialog.getByRole("button", { name: "Approve trial" }).click();
  expect(writes).toBe(0);
  await dialog
    .getByLabel("Detailed verification reason")
    .fill("Verified company and contact details");
  await dialog.getByRole("button", { name: "Approve trial" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Review conflict");
  await expect(dialog.getByLabel("Detailed verification reason")).toHaveValue(
    "Verified company and contact details",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page
    .getByLabel("Detailed verification reason")
    .fill("Verified company and contact details");
  fail = false;
  await page.getByRole("button", { name: "Approve trial" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Trial approved" }),
  ).toContainText("Trial approved");
});
test("Sales direct management navigation redirects to owned clients", async ({
  page,
}) => {
  await setup(
    page,
    (key) => (key === "clients" ? { docs: [], count: 0, pages: 1 } : undefined),
    "Sales Agent",
  );
  await page.goto("/payment-settings");
  await expect(page).toHaveURL(/\/clients$/);
  await expect(page.getByRole("heading", { name: "Clients", exact: true })).toBeVisible();
  if (await page.getByRole("button", { name: "Open navigation" }).isVisible())
    await page.getByRole("button", { name: "Open navigation" }).click();
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByText("Administration", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Import existing CRM" })).toHaveCount(0);
});

test("renewal verification blocks mismatched approval, retains failed rejection and submits reason", async ({
  page,
}) => {
  let fail = true,
    saved;
  const row = {
    id: "222222222222222222222222",
    companyName: "Renewal Client",
    planName: "Yearly",
    fromCycle: "monthly",
    targetCycle: "annual",
    status: "pending",
    amountDue: 12000000,
    transferredAmount: 10000000,
    currency: "PKR",
    sourceBankName: "Sender Bank",
    sourceAccountNumber: "00112233",
    createdAt: "2026-10-26T00:00:00Z",
    receivingBank: { bankName: "Receiver", accountNumber: "00445566" },
  };
  await setup(page, (key, req) => {
    if (key.endsWith("/proof"))
      return {
        data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2WQAAAAASUVORK5CYII=",
      };
    if (key.endsWith("/review")) {
      saved = req.postDataJSON();
      return fail
        ? { httpStatus: 409, message: "Payment review changed" }
        : { ...row, status: "rejected" };
    }
    if (key === "renewals") return { docs: [row], count: 1, pages: 1 };
  });
  await page.goto("/renewals");
  await page.getByRole("button", { name: "Verify payment" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "Approve renewal" })).toBeDisabled();
  await dialog.getByLabel("Decision").selectOption("rejected");
  await dialog
    .getByLabel("Detailed verification reason", { exact: false })
    .fill("Transferred amount does not match the quote");
  await dialog.getByRole("button", { name: "Reject request" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Payment review changed");
  await expect(
    dialog.getByLabel("Detailed verification reason", { exact: false }),
  ).toHaveValue("Transferred amount does not match the quote");
  fail = false;
  await dialog.getByRole("button", { name: "Reject request" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Request rejected" }),
  ).toContainText("Request rejected");
  expect(saved.decision).toBe("rejected");
  expect(saved.reason).toContain("does not match");
});

test("Sales client to trial to CRM Owner flow survives reload without paid actions", async ({
  page,
}) => {
  let clients = [],
    subscriptions = [],
    users = [];
  await setup(
    page,
    (key, req) => {
      if (key === "options") return { clients, subscriptions, plans: [], industries: [] };
      if (key === "clients" && req.method() === "POST") {
        const row = { ...req.postDataJSON(), id: "333333333333333333333333" };
        clients.push(row);
        return row;
      }
      if (key === "clients") return { docs: clients, count: clients.length, pages: 1 };
      if (key.endsWith("/trial")) {
        const row = {
          clientId: clients[0].id,
          status: "trial",
          cycle: "monthly",
          id: "444444444444444444444444",
        };
        subscriptions.push(row);
        return row;
      }
      if (key === "users" && req.method() === "POST") {
        const row = { ...req.postDataJSON(), id: "555555555555555555555555" };
        users.push(row);
        return row;
      }
      if (key === "users") return { docs: users, count: users.length, pages: 1 };
    },
    "Sales Agent",
  );
  await page.goto("/clients");
  await page.getByRole("button", { name: "Add client" }).click();
  let dialog = page.getByRole("dialog");
  for (const [label, value] of [
    ["Company name", "Browser Client"],
    ["Company ID", "browser-client"],
    ["Owner email", "browser@example.com"],
    ["Phone", "+923001234567"],
    ["Industry", "Property"],
  ])
    await dialog.getByLabel(label, { exact: true }).fill(value);
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("cell", { name: "Browser Client", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Grant 14-day trial" }).click();
  await expect(
    page.getByRole("button", { name: "Trial / subscription assigned" }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "Browser Client", exact: true }),
  ).toBeVisible();
  await page.goto("/users");
  await page.getByRole("button", { name: "Create CRM Owner" }).click();
  dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Client organization", exact: true })
    .selectOption("browser-client");
  await dialog.getByLabel("Full name", { exact: true }).fill("Browser Owner");
  await dialog.getByLabel("Email", { exact: true }).fill("browser-owner@example.com");
  await dialog
    .getByLabel("Password (12+ characters; blank retains existing)", { exact: true })
    .fill("Browser-test-password-123");
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("cell", { name: "Browser Owner", exact: true }),
  ).toBeVisible();
  expect(users[0].organizationId).toBe("browser-client");
  expect(users[0].role).toBe("Admin");
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toHaveCount(0);
});
