// ============================================================================
// Authentication Logger
// ============================================================================

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  context?: LogContext;
  message?: string;
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function createLogEntry(
  level: LogLevel,
  event: string,
  context?: LogContext,
  message?: string
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...(context && { context }),
    ...(message && { message }),
  };
}

export const authLogger = {
  /**
   * Log successful login
   */
  loginSuccess: (context: LogContext) => {
    const entry = createLogEntry('info', 'AUTH_LOGIN_SUCCESS', context);
    console.log(formatLog(entry));
  },

  /**
   * Log failed login attempt
   */
  loginFailure: (context: LogContext, reason: string) => {
    const entry = createLogEntry('warn', 'AUTH_LOGIN_FAILURE', context, reason);
    console.warn(formatLog(entry));
  },

  /**
   * Log successful registration
   */
  registerSuccess: (context: LogContext) => {
    const entry = createLogEntry('info', 'AUTH_REGISTER_SUCCESS', context);
    console.log(formatLog(entry));
  },

  /**
   * Log failed registration
   */
  registerFailure: (context: LogContext, reason: string) => {
    const entry = createLogEntry('warn', 'AUTH_REGISTER_FAILURE', context, reason);
    console.warn(formatLog(entry));
  },

  /**
   * Log logout
   */
  logout: (context: LogContext) => {
    const entry = createLogEntry('info', 'AUTH_LOGOUT', context);
    console.log(formatLog(entry));
  },

  /**
   * Log token verification success
   */
  tokenVerifySuccess: (context: LogContext) => {
    const entry = createLogEntry('info', 'AUTH_TOKEN_VERIFY_SUCCESS', context);
    console.log(formatLog(entry));
  },

  /**
   * Log token verification failure
   */
  tokenVerifyFailure: (context: LogContext, reason: string) => {
    const entry = createLogEntry('warn', 'AUTH_TOKEN_VERIFY_FAILURE', context, reason);
    console.warn(formatLog(entry));
  },

  /**
   * Log missing token
   */
  tokenMissing: (context: LogContext) => {
    const entry = createLogEntry('warn', 'AUTH_TOKEN_MISSING', context);
    console.warn(formatLog(entry));
  },

  /**
   * Log session retrieval
   */
  sessionRetrieved: (context: LogContext) => {
    const entry = createLogEntry('info', 'AUTH_SESSION_RETRIEVED', context);
    console.log(formatLog(entry));
  },

  /**
   * Log session error
   */
  sessionError: (context: LogContext, reason: string) => {
    const entry = createLogEntry('error', 'AUTH_SESSION_ERROR', context, reason);
    console.error(formatLog(entry));
  },
};

export default authLogger;
