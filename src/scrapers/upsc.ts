import { BaseScraper } from './base';
import { JobNotification } from '../core/types';
import { Page } from 'playwright';
import { logger } from '../utils/logger';

export class UPSCScraper extends BaseScraper {
  constructor() {
    super({
      id: 'upsc',
      name: 'Union Public Service Commission',
      baseUrl: 'https://upsc.gov.in',
      frequency: 'every 4 hours'
    });
  }

  protected async scrapeLogic(page: Page): Promise<JobNotification[]> {
    const url = `${this.config.baseUrl}/recruitment/recruitment-advertisement`;
    await this.safeGoTo(page, url);

    // Wait for either rows or empty message
    try {
      await page.waitForSelector('.views-row, .view-empty', { timeout: 10000 });
    } catch (e) {
      logger.warn('Timeout waiting for selector on UPSC page');
      return [];
    }

    const isEmpty = await page.locator('.view-empty').count() > 0;
    if (isEmpty) {
      logger.info('UPSC: No active advertisements found.');
      return [];
    }

    const rows = await page.locator('.views-row').all();
    const notifications: JobNotification[] = [];

    for (const row of rows) {
      try {
        const linkEl = row.locator('a').first();
        const title = await linkEl.innerText();
        const pdfUrl = await linkEl.getAttribute('href');

        if (title && pdfUrl) {
           // Clean up title
           const cleanTitle = title.replace(/\(\d+(\.\d+)?\s*[KMG]B\)/i, '').trim(); // Remove file size
           
           // Construct absolute URL if relative
           const fullPdfUrl = pdfUrl.startsWith('http') ? pdfUrl : `${this.config.baseUrl}${pdfUrl}`;

           // Try to extract date from title or use current date as fallback for 'notificationDate'
           // Upsc usually has "Advertisement No.14 - 2025"
           // We can assume notification date is recent if it's on this page.
           
           notifications.push({
             title: cleanTitle,
             organization: 'Union Public Service Commission (UPSC)',
             sourceUrl: url,
             officialPdfUrl: fullPdfUrl,
             applyLink: 'https://upsconline.nic.in/', // Generic apply link for UPSC
             notificationDate: new Date().toISOString(), // Fallback, normally we'd parse from content inside PDF or a date column
             id: `upsc-${cleanTitle.replace(/\s+/g, '-').toLowerCase()}`
           });
        }
      } catch (e) {
        logger.error('Error parsing UPSC row', e);
      }
    }

    return notifications;
  }
}
