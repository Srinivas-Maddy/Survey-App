import { test, expect } from "@playwright/test";

const API_BASE = "http://localhost:3000/api";

test.describe("API Endpoints", () => {
  test("GET /api/auth/me returns 401 when not authenticated", async ({ request }) => {
    const res = await request.get(`${API_BASE}/auth/me`);
    expect(res.status()).toBe(401);
  });

  test("POST /api/auth/register creates a user", async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: {
        name: "API Test User",
        email: `api_test_${Date.now()}@example.com`,
        password: "Test@1234",
      },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.user).toBeDefined();
    expect(data.user.name).toBe("API Test User");
  });

  test("POST /api/auth/register rejects duplicate email", async ({ request }) => {
    const email = `dup_${Date.now()}@example.com`;
    // First registration
    await request.post(`${API_BASE}/auth/register`, {
      data: { name: "User One", email, password: "Test@1234" },
    });
    // Duplicate
    const res = await request.post(`${API_BASE}/auth/register`, {
      data: { name: "User Two", email, password: "Test@1234" },
    });
    expect(res.status()).toBe(400);
  });

  test("POST /api/auth/login with valid credentials", async ({ request }) => {
    const email = `login_${Date.now()}@example.com`;
    await request.post(`${API_BASE}/auth/register`, {
      data: { name: "Login User", email, password: "Test@1234" },
    });
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email, password: "Test@1234" },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.user).toBeDefined();
  });

  test("POST /api/auth/login with wrong password returns 401", async ({ request }) => {
    const res = await request.post(`${API_BASE}/auth/login`, {
      data: { email: "nonexist@example.com", password: "wrong" },
    });
    expect(res.status()).toBe(401);
  });

  test("GET /api/surveys requires auth", async ({ request }) => {
    const res = await request.get(`${API_BASE}/surveys`);
    expect(res.status()).toBe(401);
  });

  test("Full survey lifecycle via API", async ({ request }) => {
    const email = `lifecycle_${Date.now()}@example.com`;

    // Register
    const regRes = await request.post(`${API_BASE}/auth/register`, {
      data: { name: "Lifecycle User", email, password: "Test@1234" },
    });
    expect(regRes.status()).toBe(200);

    // Create survey (cookies are auto-stored by request context)
    const createRes = await request.post(`${API_BASE}/surveys`, {
      data: {
        title: "API Test Survey",
        description: "Created via API test",
        questions: [
          { id: "q1", type: "text", label: "Your name?", required: true, options: [] },
          { id: "q2", type: "rating", label: "Rate us", required: false, options: [] },
          { id: "q3", type: "phone", label: "Phone number?", required: false, options: [] },
          { id: "q4", type: "email", label: "Email address?", required: false, options: [] },
        ],
      },
    });
    expect(createRes.status()).toBe(201);
    const { survey } = await createRes.json();
    expect(survey.title).toBe("API Test Survey");
    expect(survey.publicId).toBeDefined();

    // List surveys
    const listRes = await request.get(`${API_BASE}/surveys`);
    expect(listRes.status()).toBe(200);
    const listData = await listRes.json();
    expect(listData.surveys.length).toBeGreaterThan(0);

    // Get public survey
    const pubRes = await request.get(`${API_BASE}/public/${survey.publicId}`);
    expect(pubRes.status()).toBe(200);
    const pubData = await pubRes.json();
    expect(pubData.survey.title).toBe("API Test Survey");

    // Submit response
    const submitRes = await request.post(`${API_BASE}/public/${survey.publicId}`, {
      data: {
        answers: { q1: "John Doe", q2: "4", q3: "+1234567890", q4: "john@example.com" },
      },
    });
    expect(submitRes.status()).toBe(201);

    // Get survey with responses
    const detailRes = await request.get(`${API_BASE}/surveys/${survey._id}`);
    expect(detailRes.status()).toBe(200);
    const detailData = await detailRes.json();
    expect(detailData.responses.length).toBe(1);
    expect(detailData.responses[0].answers.q1).toBe("John Doe");

    // Toggle inactive
    const toggleRes = await request.patch(`${API_BASE}/surveys/${survey._id}/toggle`);
    expect(toggleRes.status()).toBe(200);
    const toggleData = await toggleRes.json();
    expect(toggleData.survey.isActive).toBe(false);

    // Public survey should be unavailable
    const pubInactiveRes = await request.get(`${API_BASE}/public/${survey.publicId}`);
    expect(pubInactiveRes.status()).toBe(404);

    // Delete survey
    const delRes = await request.delete(`${API_BASE}/surveys/${survey._id}`);
    expect(delRes.status()).toBe(200);
  });

  test("QR code endpoint returns data URL", async ({ request }) => {
    const email = `qr_${Date.now()}@example.com`;
    await request.post(`${API_BASE}/auth/register`, {
      data: { name: "QR User", email, password: "Test@1234" },
    });
    const createRes = await request.post(`${API_BASE}/surveys`, {
      data: {
        title: "QR Survey",
        description: "",
        questions: [{ id: "q1", type: "text", label: "Test?", required: false, options: [] }],
      },
    });
    const { survey } = await createRes.json();

    const qrRes = await request.get(`${API_BASE}/surveys/${survey._id}/qrcode`);
    expect(qrRes.status()).toBe(200);
    const qrData = await qrRes.json();
    expect(qrData.qrDataUrl).toContain("data:image/png;base64");
    expect(qrData.publicUrl).toContain(`/s/${survey.publicId}`);
  });
});
