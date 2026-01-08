/**
 * Dummy function to simulate real-time ingestion every 5 seconds
 */
const startDummyIngestion = (io) => {
  setInterval(() => {
    const dummyLog = {
      level: "error",
      message: "Failed to connect to database. Connection timeout after 30s",
      resourceId: "server-1234",
      timestamp: new Date().toISOString(), // Using current time for better UI tracking
      traceId: "abc-xyz-123",
      spanId: "span-456",
      commit: "5e5342f",
      metadata: { 
        parentResourceId: "server-5678", 
        retryCount: "3" 
      },
      _id: "695f9b51a2d048130c2a32af"
    };

    // Emit the event to all connected clients
    io.emit("new-log", dummyLog);
    
    console.log("Simulated log emitted: ", dummyLog.level);
  }, 40000); // 40000 milliseconds = 40 seconds
};

module.exports = { startDummyIngestion };