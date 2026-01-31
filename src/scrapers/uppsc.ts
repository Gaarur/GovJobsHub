import { BaseScraper } from './base';
import { JobNotification } from '../core/types';
import { Page } from 'playwright';
import { logger } from '../utils/logger';

export class UPPSCScraper extends BaseScraper {
  constructor() {
    super({
      id: 'uppsc',
      name: 'Uttar Pradesh Public Service Commission',
      baseUrl: 'https://uppsc.up.nic.in',
      frequency: 'every 4 hours'
    });
  }

  protected async scrapeLogic(page: Page): Promise<JobNotification[]> {
    const url = `${this.config.baseUrl}/CandidatePages/Notifications.aspx`;
    await this.safeGoTo(page, url);

    // Wait for table to load
    try {
      logger.info('UPPSC: Waiting for table...');
      await page.waitForSelector('table', { timeout: 30000 });
      logger.info('UPPSC: Table found.');
    } catch (e) {
      logger.warn('Timeout waiting for table on UPPSC page');
      return [];
    }

    // Try a more generic selector first
    const allRows = await page.locator('table tr').all();
    logger.info(`UPPSC: Found ${allRows.length} total rows in tables.`);

    const rows = await page.locator('tr:has(span[id*="Lbl_Mode"])').all();
    logger.info(`UPPSC: Found ${rows.length} rows with Lbl_Mode.`);
    
    const notifications: JobNotification[] = [];

    for (const row of rows) {
      try {
        const examName = await row.locator('span[id$="Lbl_Exam_Name"]').innerText();
        const advtNo = await row.locator('span[id$="Lbl_Adv_number"]').innerText();
        const advtDate = await row.locator('span[id$="Lbl_adv_date"]').innerText();
        const startDate = await row.locator('span[id$="Lbl_Gazette_Date"]').innerText();
        const endDate = await row.locator('span[id$="Lbl_ApplicationFormRegistration_LastDate"]').innerText();
        
        const viewAdLinkEl = row.locator('a:has-text("View Advertisement")');
        let pdfUrl = '';
        if (await viewAdLinkEl.count() > 0) {
            const href = await viewAdLinkEl.getAttribute('href');
            if (href) {
                pdfUrl = href.startsWith('..') ? href.replace('..', this.config.baseUrl) : href;
                if (!pdfUrl.startsWith('http')) pdfUrl = `${this.config.baseUrl}/${pdfUrl}`;
            }
        }

        const applyLinkEl = row.locator('a:has-text("Apply")');
        // Apply link is often a javascript postback, so we might just point to the notifications page
        const applyLink = url;

        const title = `${examName} (${advtNo})`;

        // Helper to convert DD/MM/YYYY to ISO
        const parseDate = (d: string) => {
            if (!d) return undefined;
            const [day, month, year] = d.split('/');
            return new Date(`${year}-${month}-${day}`).toISOString();
        };

        notifications.push({
          title: title.trim(),
          organization: 'Uttar Pradesh Public Service Commission (UPPSC)',
          sourceUrl: url,
          officialPdfUrl: pdfUrl,
          applyLink: applyLink,
          notificationDate: parseDate(advtDate),
          applicationStartDate: parseDate(startDate),
          applicationLastDate: parseDate(endDate),
          id: `uppsc-${advtNo.replace(/\W/g, '-').toLowerCase()}`
        });

      } catch (e) {
        logger.error('Error parsing UPPSC row', e);
      }
    }

    return notifications;
  }
}
