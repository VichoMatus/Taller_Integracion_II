import { ENV, isDevelopment } from "./env";

/**
 * Niveles de log disponibles.
 */
type LogLevel = "error" | "warn" | "info" | "debug";

/**
 * Clase simple de logger con diferentes niveles.
 */
class Logger {
  private level: LogLevel;
  private levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  constructor(level: LogLevel = "info") {
    this.level = level;
  }

  /**
   * Verifica si un nivel de log está habilitado.
   */
  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] <= this.levels[this.level];
  }

  /**
   * Formatea el mensaje de log.
   */
  private format(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  /**
   * Log de error.
   */
  error(message: string, meta?: any): void {
    if (this.shouldLog("error")) {
      console.error(this.format("error", message, meta));
    }
  }

  /**
   * Log de warning.
   */
  warn(message: string, meta?: any): void {
    if (this.shouldLog("warn")) {
      console.warn(this.format("warn", message, meta));
    }
  }

  /**
   * Log de información.
   */
  info(message: string, meta?: any): void {
    if (this.shouldLog("info")) {
      console.log(this.format("info", message, meta));
    }
  }

  /**
   * Log de debug.
   */
  debug(message: string, meta?: any): void {
    if (this.shouldLog("debug")) {
      console.log(this.format("debug", message, meta));
    }
  }
}

/**
 * Instancia global del logger configurada según el ambiente.
 */
export const logger = new Logger(ENV.LOG_LEVEL as LogLevel);
