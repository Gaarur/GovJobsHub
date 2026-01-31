import { IScraper, ScraperConfig, JobNotification } from '../core/types';
import { logger } from '../utils/logger';
import { chromium, Browser, Page } from 'playwright';

export abstract class BaseScraper implements IScraper {
  config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  protected abstract scrapeLogic(page: Page): Promise<JobNotification[]>;

  async scrape(): Promise<JobNotification[]> {
    logger.info(`Starting scraper: ${this.config.name}`);
    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      });
      const page = await context.newPage();
      
      // Common timeout and navigation settings
      page.setDefaultTimeout(30000);

      const jobs = await this.scrapeLogic(page);
      
      logger.info(`Scraper ${this.config.name} finished. Found ${jobs.length} jobs.`);
      return jobs;
    } catch (error) {
      logger.error(`Error in scraper ${this.config.name}:`, error);
      return [];
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  protected async safeGoTo(page: Page, url: string) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
    } catch (e) {
      logger.error(`Failed to navigate to ${url}`, e);
      throw e;
    }
  }

  protected sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
