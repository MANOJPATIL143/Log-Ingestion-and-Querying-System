import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import FilterBar from "./FilterBar";
import LogEntry from "./LogEntry";
import LogAnalytics from "./LogAnalytics";
import {
  Search,
  AlertCircle,
  Loader2,
  Rss,
  BarChart3,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// API base URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: "",
    message: "",
    resourceId: "",
    timestamp_start: "",
    timestamp_end: "",
    traceId: "",
    spanId: "",
    commit: "",
  });

  // Fetch logs from backend with current filters
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key] !== "all") {
          params[key] = filters[key];
        }
      });

      const response = await axios.get(`${API}/logs`, { params });
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to fetch logs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Function to seed sample logs
  const seedSampleLogs = async () => {
    try {
      const response = await axios.post(`${API}/logs/seed`);
      toast.success(`${response.data.count} sample logs seeded successfully!`);
      fetchLogs();
    } catch (error) {
      console.error("Error seeding logs:", error);
      toast.error("Failed to seed sample logs.");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      level: "",
      message: "",
      resourceId: "",
      timestamp_start: "",
      timestamp_end: "",
      traceId: "",
      spanId: "",
      commit: "",
    });
  };

  // Ingest a dummy error log for testing
  const ingestDummyLog = async () => {
    const dummyLog = {
      level: "error",
      message: "Failed to connect to database. Connection timeout after 30s",
      resourceId: "server-1234",
      timestamp: new Date().toISOString(), // Using current time so it shows at the top
      traceId: "abc-xyz-123",
      spanId: "span-456",
      commit: "5e5342f",
      metadata: { parentResourceId: "server-5678", retryCount: "3" },
    };

    try {
      const response = await axios.post(`${API}/logs`, dummyLog);
      if (response.status === 201) {
        // toast.success("Dummy log ingested successfully!");
        fetchLogs();
      }
    } catch (error) {
      console.error("Ingestion error:", error);
      toast.error("Failed to ingest dummy log.");
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden relative z-10">
      {/* Header */}
      <header className="h-14 border-b border-border/40 bg-background/80 backdrop-blur-md flex items-center px-6 justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
            <Rss className="w-4 h-4 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-xl tracking-tight text-foreground">
            Console
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={ingestDummyLog}
            className="flex items-center gap-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 h-8 px-3 rounded-md transition-all border border-red-500/20 text-xs font-medium"
          >
            <Send className="w-3.5 h-3.5" />
            Ingest Error
          </button>

          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 text-xs font-medium rounded-md transition-all active:scale-95">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-background border-border/40">
              <DialogHeader>
                <DialogTitle>System Analytics</DialogTitle>
              </DialogHeader>
              {/* Passing the current filtered logs to the chart */}
              <div className="py-4">
                <LogAnalytics logs={logs} />
              </div>
            </DialogContent>
          </Dialog>

          <button
            onClick={seedSampleLogs}
            data-testid="seed-logs-button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 text-xs font-medium rounded-md transition-all active:scale-95"
          >
            Seed Sample Logs
          </button>

          <TooltipProvider>
            <Tooltip>
              {/* 'asChild' is crucial here so the Tooltip uses your button as the trigger */}
              <TooltipTrigger asChild>
                <button
                  onClick={fetchLogs}
                  data-testid="refresh-logs-button"
                  className="hover:bg-secondary/50 text-muted-foreground hover:text-foreground h-8 w-8 p-0 rounded-md flex items-center justify-center transition-colors"
                >
                  <Loader2
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </TooltipTrigger>

              <TooltipContent side="bottom">
                <p>Refresh Logs</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onApplyFilters={fetchLogs}
      />

      {/* Log Stream */}
      <div
        className="flex-1 overflow-auto custom-scrollbar"
        data-testid="log-stream"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="font-mono text-sm text-muted-foreground">
                Loading logs...
              </p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state" data-testid="empty-state">
            <div className="glass-panel p-8 rounded-lg border border-border/40 max-w-md">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-heading font-semibold text-xl text-center mb-2">
                No logs found
              </h2>
              <p className="font-body text-sm text-muted-foreground text-center mb-6">
                Try adjusting your filters or seed some sample logs to get
                started.
              </p>
              <button
                onClick={seedSampleLogs}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 text-sm font-medium rounded-md transition-all active:scale-95 w-full"
              >
                Seed Sample Logs
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {logs.map((log, index) => (
              <LogEntry key={index} log={log} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {!loading && logs.length > 0 && (
        <div className="h-10 border-t border-border/40 bg-background/80 backdrop-blur-md flex items-center px-6 z-50">
          <p className="font-mono text-xs text-muted-foreground">
            Showing{" "}
            <span className="text-foreground font-medium">{logs.length}</span>{" "}
            log{logs.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default LogViewer;
