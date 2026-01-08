const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const path = require("path");
const { logEntrySchema } = require("./schemas/logSchema");
const http = require("http");
const { Server } = require("socket.io");
const { startDummyIngestion } = require("./dummyFn/startDummyIngestion");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// MongoDB connection
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;
let client;
let db;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors({
//   origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
//   credentials: true
// }));
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://log-ingestion-and-querying-system.netlify.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
startDummyIngestion(io);

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db(dbName);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Routes
app.get("/api/", (req, res) => {
  res.json({ message: "Log Ingestion and Querying System API" });
});

app.post("/api/logs", async (req, res) => {
  console.log("Received log ingestion request:", req.body);
  try {
    // Validate request body
    const { error, value } = logEntrySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ detail: error.details[0].message });
    }

    const log = value;

    // Validate timestamp format
    const timestamp = new Date(log.timestamp);
    if (isNaN(timestamp.getTime())) {
      return res
        .status(400)
        .json({ detail: "Invalid timestamp format. Must be ISO 8601 format." });
    }

    // Insert into MongoDB
    const result = await db.collection("logs").insertOne(log);

    if (!result.insertedId) {
      return res.status(500).json({ detail: "Failed to insert log entry" });
    }
    io.emit("new-log", log);
    console.log(
      `Log ingested successfully: ${log.level} - ${log.message.substring(
        0,
        50
      )}`
    );
    res.status(201).json(log);
  } catch (error) {
    console.error("Error ingesting log:", error);
    res.status(500).json({ detail: `Internal server error: ${error.message}` });
  }
});

app.get("/api/logs", async (req, res) => {
  try {
    const {
      level,
      message,
      resourceId,
      timestamp_start,
      timestamp_end,
      traceId,
      spanId,
      commit,
    } = req.query;

    // Build query filter
    const queryFilter = {};
    res.set("Cache-Control", "no-store"); // Force fresh fetch

    if (level) {
      queryFilter.level = level.toLowerCase();
    }

    if (message) {
      // Case-insensitive regex search
      queryFilter.message = {
        $regex: message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    if (resourceId) {
      queryFilter.resourceId = resourceId;
    }

    if (timestamp_start || timestamp_end) {
      queryFilter.timestamp = {};
      if (timestamp_start) {
        queryFilter.timestamp.$gte = timestamp_start;
      }
      if (timestamp_end) {
        queryFilter.timestamp.$lte = timestamp_end;
      }
    }

    if (traceId) {
      queryFilter.traceId = traceId;
    }

    if (spanId) {
      queryFilter.spanId = spanId;
    }

    if (commit) {
      queryFilter.commit = commit;
    }

    // Query MongoDB and sort by timestamp descending
    const logs = await db
      .collection("logs")
      .find(queryFilter, { projection: { _id: 0 } })
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();

    console.log(
      `Query returned ${logs.length} logs with filters:`,
      queryFilter
    );
    // res.status(200).json(logs);
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error querying logs:", error);
    res.status(500).json({ detail: `Internal server error: ${error.message}` });
  }
});

app.post("/api/logs/seed", async (req, res) => {
  try {
    // Clear existing logs
    await db.collection("logs").deleteMany({});

    const sampleLogs = [
      {
        level: "error",
        message: "Failed to connect to database. Connection timeout after 30s",
        resourceId: "server-1234",
        timestamp: "2025-09-15T08:00:00Z",
        traceId: "abc-xyz-123",
        spanId: "span-456",
        commit: "5e5342f",
        metadata: { parentResourceId: "server-5678", retryCount: 3 },
      },
      {
        level: "warn",
        message: "High memory usage detected: 85% of available RAM",
        resourceId: "server-1234",
        timestamp: "2025-09-15T08:05:00Z",
        traceId: "def-uvw-456",
        spanId: "span-789",
        commit: "5e5342f",
        metadata: { memoryUsage: "85%", threshold: "80%" },
      },
      {
        level: "info",
        message: "User authentication successful",
        resourceId: "auth-service-001",
        timestamp: "2025-09-15T08:10:00Z",
        traceId: "ghi-rst-789",
        spanId: "span-012",
        commit: "7a8b9c0",
        metadata: { userId: "user-12345", method: "oauth2" },
      },
      {
        level: "debug",
        message: "API request received: GET /api/users?page=1&limit=10",
        resourceId: "api-gateway-01",
        timestamp: "2025-09-15T08:15:00Z",
        traceId: "jkl-opq-012",
        spanId: "span-345",
        commit: "7a8b9c0",
        metadata: { endpoint: "/api/users", method: "GET" },
      },
      {
        level: "error",
        message: "Payment processing failed: Invalid credit card number",
        resourceId: "payment-service-02",
        timestamp: "2025-09-15T08:20:00Z",
        traceId: "mno-lmn-345",
        spanId: "span-678",
        commit: "9d1e2f3",
        metadata: { orderId: "order-98765", errorCode: "INVALID_CARD" },
      },
      {
        level: "info",
        message: "Database backup completed successfully",
        resourceId: "backup-service-01",
        timestamp: "2025-09-15T08:25:00Z",
        traceId: "pqr-ijk-678",
        spanId: "span-901",
        commit: "9d1e2f3",
        metadata: { backupSize: "2.5GB", duration: "45s" },
      },
      {
        level: "warn",
        message: "Rate limit approaching: 90% of hourly quota used",
        resourceId: "api-gateway-01",
        timestamp: "2025-09-15T08:30:00Z",
        traceId: "stu-ghi-901",
        spanId: "span-234",
        commit: "4c5d6e7",
        metadata: { currentRequests: 9000, maxRequests: 10000 },
      },
      {
        level: "debug",
        message: "Cache hit for key: user_profile_12345",
        resourceId: "cache-service-01",
        timestamp: "2025-09-15T08:35:00Z",
        traceId: "vwx-def-234",
        spanId: "span-567",
        commit: "4c5d6e7",
        metadata: { cacheKey: "user_profile_12345", ttl: 3600 },
      },
      {
        level: "error",
        message: "External API timeout: Weather service not responding",
        resourceId: "integration-service-03",
        timestamp: "2025-09-15T08:40:00Z",
        traceId: "yza-abc-567",
        spanId: "span-890",
        commit: "1f2g3h4",
        metadata: { service: "weather-api", timeout: "10s" },
      },
      {
        level: "info",
        message: "New user registration completed",
        resourceId: "auth-service-001",
        timestamp: "2025-09-15T08:45:00Z",
        traceId: "bcd-xyz-890",
        spanId: "span-123",
        commit: "1f2g3h4",
        metadata: { userId: "user-67890", registrationMethod: "email" },
      },
    ];

    // Insert sample logs
    const result = await db.collection("logs").insertMany(sampleLogs);

    res.status(201).json({
      message: "Sample logs seeded successfully",
      count: result.insertedCount,
    });
  } catch (error) {
    console.error("Error seeding sample logs:", error);
    res.status(500).json({ detail: `Internal server error: ${error.message}` });
  }
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down gracefully...");
  if (client) await client.close();
  if (require.main === module) process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

io.on("connection", (socket) => {
  console.log("Client connected to WebSockets:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected"));
});

// Start server
if (require.main === module) {
  connectToMongoDB().then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
