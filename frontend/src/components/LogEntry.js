import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const LogEntry = ({ log }) => {
  const [expanded, setExpanded] = useState(false);

  // Determine level badge class
  const getLevelClass = (level) => {
    const levelMap = {
      error: 'level-error',
      warn: 'level-warn',
      info: 'level-info',
      debug: 'level-debug'
    };
    return levelMap[level.toLowerCase()] || 'level-info';
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return format(date, 'MMM dd, HH:mm:ss.SSS');
    } catch {
      return timestamp;
    }
  };

  return (
    <div 
      className="group flex flex-col py-2 px-4 hover:bg-white/[0.02] log-entry-transition cursor-pointer"
      onClick={() => setExpanded(!expanded)}
      data-testid="log-entry"
    >
      {/* Main Log Row */}
      <div className="flex items-start gap-3">
        {/* Expand Icon */}
        <div className="shrink-0 pt-0.5">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>

        {/* Timestamp */}
        <div className="font-mono text-muted-foreground text-xs w-36 shrink-0 pt-0.5" data-testid="log-timestamp">
          {formatTimestamp(log.timestamp)}
        </div>

        {/* Level Badge */}
        <div className="shrink-0">
          <span className={`level-badge ${getLevelClass(log.level)}`} data-testid="log-level">
            {log.level}
          </span>
        </div>

        {/* Message */}
        <div className="flex-1 font-mono text-foreground/90 text-xs leading-5 break-all" data-testid="log-message">
          {log.message}
        </div>

        {/* Resource ID */}
        <div className="font-mono text-muted-foreground/70 text-[10px] w-32 shrink-0 text-right pt-0.5" data-testid="log-resource">
          {log.resourceId}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="ml-[52px] mt-3 pt-3 border-t border-border/20 grid grid-cols-2 gap-4" data-testid="log-details">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-1">Trace ID</p>
            <p className="font-mono text-xs text-foreground/80">{log.traceId}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-1">Span ID</p>
            <p className="font-mono text-xs text-foreground/80">{log.spanId}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-1">Commit</p>
            <p className="font-mono text-xs text-foreground/80">{log.commit}</p>
          </div>
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="col-span-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-1">Metadata</p>
              <pre className="font-mono text-xs text-foreground/80 bg-muted/30 p-2 rounded overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogEntry;