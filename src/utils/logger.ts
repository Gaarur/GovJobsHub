export const logger = {
  info: (message: string, context?: any) => {
    console.error(`[INFO] [${new Date().toISOString()}] ${message}`, context ? JSON.stringify(context) : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, error);
  },
  warn: (message: string, context?: any) => {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, context ? JSON.stringify(context) : '');
  }
};
