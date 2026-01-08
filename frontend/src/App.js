import { useState, useEffect } from "react";
import "@/App.css";
import LogViewer from "@/components/LogViewer";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import { io } from "socket.io-client";

// WebSocket server URL
const SOCKET_URL = "http://localhost:5000";

function App() {
  const [logs, setLogs] = useState([]);
  const { toast } = useToast();
  const socket = io(SOCKET_URL);

  useEffect(() => {
    socket.on("new-log", (newLog) => {
      console.log("New log received via WebSocket:", newLog);

      // Update logs list
      setLogs((prevLogs) => [newLog, ...prevLogs]);

      // 3. Trigger Toast here directly inside the main listener
      const isError = newLog.level === "error";
      toast({
        variant: isError ? "destructive" : "default",
        title: `New ${newLog.level.toUpperCase()} Log: ${newLog.resourceId}`,
        timeeermout: 1000,
        description: (
          <div className="flex flex-col gap-1 mt-1">
            <p className="font-medium leading-none">{newLog.message}</p>
            <div className="flex gap-2 text-[10px] opacity-70">
              <span>Trace: {newLog.traceId}</span>
              <span>Commit: {newLog.commit}</span>
            </div>
          </div>
        ),
      });
    });

    return () => socket.off("new-log");
  }, [toast]);

  return (
    <div className="App">
      <div className="gradient-overlay" />
      <div className="scanlines" />
      <LogViewer />
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}

export default App;
