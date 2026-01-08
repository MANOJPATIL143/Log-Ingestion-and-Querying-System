const request = require("supertest");
const app = require("./server");

describe("Log Ingestion API Tests", () => {
  let testsRun = 0;
  let testsPassed = 0;

  // 1. Test Root Endpoint
  test("GET /api - Root API Endpoint", async () => {
    const res = await request(app).get("/api");
    expect(res.statusCode).toBe(200);
  });

  // 2. Test Seeding
  test("POST /api/logs/seed - Seed Sample Logs", async () => {
    const res = await request(app).post("/api/logs/seed");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("count");
    console.log(`   Seeded ${res.body.count} logs`);
  });

  // 3. Test Valid Log Creation
  test("POST /api/logs - Valid Log Creation", async () => {
    const validLog = {
      level: "info",
      message: "Test log message for API testing",
      resourceId: "test-server-001",
      timestamp: "2023-09-15T10:30:00Z",
      traceId: "test-trace-123",
      spanId: "test-span-456",
      commit: "abc123def",
      metadata: { test: true, environment: "testing" },
    };

    const res = await request(app).post("/api/logs").send(validLog);

    expect(res.statusCode).toBe(201);
  });

  // 4. Test Validation: Invalid Level
  test("POST /api/logs - Invalid Log Level Validation", async () => {
    const invalidLog = { level: "invalid_level", message: "test" };
    const res = await request(app).post("/api/logs").send(invalidLog);
    expect(res.statusCode).toBe(400);
  });

  // 5. Test Validation: Missing Required Fields
  test("POST /api/logs - Missing Required Fields (422)", async () => {
    const incompleteLog = { level: "info", message: "Test" };
    const res = await request(app).post("/api/logs").send(incompleteLog);
    // Note: If you're using Express-Validator, this is likely 400 or 422
    expect(res.statusCode).toBe(422);
  });

  // 6. Test Querying: Level Filter
  test("GET /api/logs - Filter by Error Level", async () => {
    const res = await request(app).get("/api/logs").query({ level: "error" });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 7. Test Querying: Message Search
  test("GET /api/logs - Search Message (case-insensitive)", async () => {
    const res = await request(app)
      .get("/api/logs")
      .query({ message: "database" });

    expect(res.statusCode).toBe(200);
  });

  // 8. Test Querying: Timestamp Range
  test("GET /api/logs - Filter by Timestamp Range", async () => {
    const res = await request(app).get("/api/logs").query({
      timestamp_start: "2023-09-15T08:00:00Z",
      timestamp_end: "2023-09-15T08:30:00Z",
    });

    expect(res.statusCode).toBe(200);
  });

  // 9. Test Log Ordering (Reverse Chronological)
  test("GET /api/logs - Log Ordering", async () => {
    const res = await request(app).get("/api/logs");
    expect(res.statusCode).toBe(200);

    const logs = res.body;
    if (logs.length > 1) {
      for (let i = 0; i < logs.length - 1; i++) {
        const current = new Date(logs[i].timestamp).getTime();
        const next = new Date(logs[i + 1].timestamp).getTime();
        // Current should be newer than or equal to the next one
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });
});
