// Simple console-based logger (no external deps)
const levels = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = levels[process.env.LOG_LEVEL] ?? levels.info;

const logger = {
  debug: (...args) => currentLevel <= levels.debug && console.debug('[DEBUG]', ...args),
  info: (...args) => currentLevel <= levels.info && console.info('[INFO]', ...args),
  warn: (...args) => currentLevel <= levels.warn && console.warn('[WARN]', ...args),
  error: (...args) => currentLevel <= levels.error && console.error('[ERROR]', ...args),
};

export { logger };
export default logger;
