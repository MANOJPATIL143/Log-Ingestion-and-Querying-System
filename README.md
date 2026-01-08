# Here are your Instructions

## Project Structure

- **Backend:**  
  - Located in `backend/`
  - Uses Express.js, MongoDB, Joi for validation, and dotenv for config.
  - Key folders:
    - `schemas/` — Joi validation schemas (e.g., `logSchema.js`)
  - Main entry: `server.js` (loads env, connects DB, mounts routes)

- **Frontend:**  
  - Located in `frontend/` 
  - Follows standard React (or specified framework) conventions.
  - Communicates with backend via `/api` endpoints.

## Key Patterns & Conventions

- **Real-Time Log Ingestion (Bonus):**    
  - `POST /api/logs` accepts log entries (validated with Joi).
  - Emits new logs via WebSocket (`io.emit("new-log", log)`).

  - **Basic Analytics View (Bonus):**  
  - The frontend includes a dashboard component that displays a simple chart (e.g., Chart.js or Recharts).
  - Shows the count of logs by level over the currently filtered time range.


- **Routing:**  
  - All API endpoints are prefixed with `/api`.
  - Route logic is separated from controller logic.
  - Example: `POST /api/logs` calls `ingestLog` in `logController.js`.

- **Validation:**  
  - All incoming log data is validated using Joi schemas in `schemas/`.
  - Validation errors return HTTP 400 with details.

- **Environment:**  
  - All sensitive config (DB URL, port, etc.) is loaded from `.env` in backend root.
  - Example `.env` keys: `MONGO_URL`, `DB_NAME`, `PORT`.

- **Error Handling:**  
  - Controllers catch and log errors, returning HTTP 500 with error details.
  - Graceful shutdown on SIGINT/SIGTERM closes DB connection.

  - **Seeding Data:**  
  - `POST /api/logs/seed` resets and seeds the logs collection with sample data.


- **Frontend-Backend Integration:**  
  - Frontend fetches logs and posts new logs via `/api/logs`.
  - Query parameters for filtering logs are passed as URL params.

## Developer Workflows

## Installation

- **Install Backend Dependencies:**  
  - Navigate to the `backend/` directory and run:
    ```
    npm install --f
    ```

- **Install Frontend Dependencies:**  
  - Navigate to the `frontend/` directory and run:
    ```
    npm install --f
    ```

- **Start Backend:**  
  - `npm start` in `backend/`
- **Start Frontend:**  
  - `npm start` in `frontend/`
- **Unit Testing (Bonus):**  
- Unit tests exist for critical backend logic, especially the log filtering function.
- Tests cover various combinations of filters to ensure correct querying.
- (See `backend/tests/` or similar for test files and usage.)
- **Seeding Data:**  
  - `POST /api/logs/seed` to reset and seed sample logs.

## Design Decisions

- **Why Express & MongoDB:**  
  - Chosen for simplicity, scalability, and ecosystem support.
- **Why Joi:**  
  - For robust, declarative request validation.
- **Why modular structure:**  
  - Separation of concerns for maintainability and testability.

## Assumptions

- MongoDB is running and accessible at the URL in `.env`.
- Frontend and backend are started separately.
- All API communication is via JSON.
