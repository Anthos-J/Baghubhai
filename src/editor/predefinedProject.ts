/**
 * Predefined project files for the AmongDevs collaborative debugging game.
 * These files represent a mini JavaScript project containing intentional bugs
 * that Developers must fix and Mafia can re-introduce or mutate.
 */

export interface EditorFile {
  id: string;
  name: string;
  language: string;
  content: string;
  description?: string;
  taskId?: string;
}

export const INITIAL_PROJECT_FILES: EditorFile[] = [
  {
    id: 'file-auth',
    name: 'auth.js',
    language: 'javascript',
    taskId: 'task-auth',
    description: 'User authentication & session validation module',
    content: `// ==========================================
// AUTHENTICATION MODULE
// ==========================================

export function login(username, password) {
  // BUG: Uses OR (||) instead of AND (&&) allowing unauthorized access
  if (username === "admin" || password === "admin123") {
    return { success: true, token: "jwt_token_admin_authorized" };
  }
  return { success: false, error: "Invalid credentials" };
}

export function validateSession(token) {
  if (!token) return false;
  return token.startsWith("jwt_token_");
}
`
  },
  {
    id: 'file-utils',
    name: 'utils.js',
    language: 'javascript',
    taskId: 'task-utils',
    description: 'Data transformation & sorting utilities',
    content: `// ==========================================
// UTILITY HELPERS
// ==========================================

export function sortScoresAscending(scores) {
  if (!Array.isArray(scores)) return [];
  // BUG: Sorting in descending order (b - a) instead of ascending (a - b)
  return [...scores].sort((a, b) => b - a);
}

export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}
`
  },
  {
    id: 'file-database',
    name: 'database.js',
    language: 'javascript',
    taskId: 'task-database',
    description: 'Database connection & query handler',
    content: `// ==========================================
// DATABASE ADAPTER
// ==========================================

export function connectDatabase() {
  // BUG: Hardcoded to return false (connection failure)
  return false;
}

export function pingDatabase() {
  const isConnected = connectDatabase();
  return isConnected ? "PONG" : "DISCONNECTED";
}
`
  },
  {
    id: 'file-payment',
    name: 'payment.js',
    language: 'javascript',
    taskId: 'task-payment',
    description: 'Payment verification & transaction processing',
    content: `// ==========================================
// PAYMENT PROCESSOR
// ==========================================

export function processTransaction(amount, balance) {
  // BUG: Amount >= 0 allows zero-amount exploit transactions
  if (amount >= 0 && balance >= amount) {
    return { status: "PROCESSED", newBalance: balance - amount };
  }
  return { status: "REJECTED", reason: "Invalid transaction amount or insufficient balance" };
}
`
  },
  {
    id: 'file-app',
    name: 'app.js',
    language: 'javascript',
    taskId: 'task-app',
    description: 'Application entry point & service initialization',
    content: `// ==========================================
// APPLICATION ENTRYPOINT
// ==========================================

export function initializeApp(config) {
  if (!config) {
    return { ready: false, error: "Missing configuration" };
  }
  // BUG: Inverted ready status check
  const isProd = config.env === "production";
  return {
    ready: isProd ? false : true,
    env: config.env || "development",
    version: "1.0.0"
  };
}
`
  }
];

/**
 * Returns a fresh, deep copy of the predefined project files.
 */
export function getInitialProjectFiles(): EditorFile[] {
  return INITIAL_PROJECT_FILES.map(f => ({ ...f }));
}
