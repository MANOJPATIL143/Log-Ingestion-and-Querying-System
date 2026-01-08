import { useState, useEffect, useCallback } from "react";
import { Search, Filter, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const FilterBar = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // ---  Debounce Logic ---
  // This hook ensures that onFilterChange is only called 500ms
  // after the user stops typing.
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(localFilters);
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilters, onFilterChange]);

  // --- Handlers ---
  const handleInputChange = (field, value) => {
    const updated = { ...localFilters, [field]: value };
    setLocalFilters(updated);
  };

  // Date pickers set ISO strings in filters
  const handleStartDateSelect = (date) => {
    setStartDate(date);
    if (date) {
      const isoString = new Date(date).toISOString();
      handleInputChange("timestamp_start", isoString);
    } else {
      handleInputChange("timestamp_start", "");
    }
  };

  // Date pickers set ISO strings in filters
  const handleEndDateSelect = (date) => {
    setEndDate(date);
    if (date) {
      const isoString = new Date(date).toISOString();
      handleInputChange("timestamp_end", isoString);
    } else {
      handleInputChange("timestamp_end", "");
    }
  };

  // Apply filters immediately
  const applyFilters = () => {
    onFilterChange(localFilters);
    onApplyFilters();
  };

  const clearAll = () => {
    setStartDate(null);
    setEndDate(null);
    setLocalFilters({
      level: "",
      message: "",
      resourceId: "",
      timestamp_start: "",
      timestamp_end: "",
      traceId: "",
      spanId: "",
      commit: "",
    });
    onClearFilters();
  };

  // Determine if any filters are active
  const hasActiveFilters = Object.values(localFilters).some((v) => v !== "");

  return (
    <div
      className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/40 p-3 shadow-sm"
      data-testid="filter-bar"
    >
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search Message */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            data-testid="filter-message-input"
            placeholder="Search message..."
            value={localFilters.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && applyFilters()}
            className="pl-9 bg-secondary/20 border-border/50 focus:border-primary/50 focus:ring-0 h-8 text-xs font-mono transition-all hover:bg-secondary/30"
          />
        </div>

        {/* Level Select */}
        <Select
          value={localFilters.level}
          onValueChange={(value) => handleInputChange("level", value)}
        >
          <SelectTrigger
            data-testid="filter-level-select"
            className="w-[140px] h-8 text-xs font-mono bg-secondary/20 border-border/50"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5" />
              <SelectValue placeholder="Level" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>

        {/* Resource ID */}
        <Input
          data-testid="filter-resource-input"
          placeholder="Resource ID..."
          value={localFilters.resourceId}
          onChange={(e) => handleInputChange("resourceId", e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && applyFilters()}
          className="w-[180px] bg-secondary/20 border-border/50 focus:border-primary/50 focus:ring-0 h-8 text-xs font-mono transition-all hover:bg-secondary/30"
        />

        {/* Start Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              data-testid="filter-start-date-button"
              variant="outline"
              className="w-[160px] h-8 text-xs font-mono bg-secondary/20 border-border/50 hover:bg-secondary/30 justify-start"
            >
              <Calendar className="w-3.5 h-3.5 mr-2" />
              {startDate ? format(startDate, "MMM dd, yyyy") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-card border-border"
            align="start"
          >
            <CalendarComponent
              mode="single"
              selected={startDate}
              onSelect={handleStartDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* End Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              data-testid="filter-end-date-button"
              variant="outline"
              className="w-[160px] h-8 text-xs font-mono bg-secondary/20 border-border/50 hover:bg-secondary/30 justify-start"
            >
              <Calendar className="w-3.5 h-3.5 mr-2" />
              {endDate ? format(endDate, "MMM dd, yyyy") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-card border-border"
            align="start"
          >
            <CalendarComponent
              mode="single"
              selected={endDate}
              onSelect={handleEndDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Apply & Clear Buttons */}
        <div className="flex gap-2 ml-auto">
          {hasActiveFilters && (
            <Button
              data-testid="clear-filters-button"
              onClick={clearAll}
              variant="ghost"
              className="h-8 px-3 text-xs font-medium hover:bg-destructive/20 hover:text-destructive"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
          <Button
            data-testid="apply-filters-button"
            onClick={applyFilters}
            disabled={!hasActiveFilters}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 text-xs font-medium rounded-md shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Filter className="w-3.5 h-3.5 mr-1" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
