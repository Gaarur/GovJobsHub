import { BaseScraper } from './base';
import { JobNotification } from '../core/types';
import { Page } from 'playwright';
import { logger } from '../utils/logger';

export class UniversalScraper extends BaseScraper {
  private targetUrl: string = '';

  constructor() {
    super({
      id: 'universal',
      name: 'Universal Scraper',
      baseUrl: '', // Will be set dynamically
      frequency: 'manual'
    });
  }

  public setTarget(url: string) {
    this.targetUrl = url;
    this.config.baseUrl = new URL(url).origin;
  }

  protected async scrapeLogic(page: Page): Promise<JobNotification[]> {
    if (!this.targetUrl) {
        throw new Error('Target URL not set for Universal Scraper');
    }

    logger.info(`Universal Scraper analyzing: ${this.targetUrl}`);
    await this.safeGoTo(page, this.targetUrl);

    // Heuristic 1: Look for Tables with "Title", "Date", "Subject" etc.
    const notifications: JobNotification[] = [];
    
    // Evaluate in browser context to find candidate elements
    const candidates = await page.evaluate(() => {
        const potentialJobs: any[] = [];
        
        // Helper to check if text looks like a date
        const isDate = (s: string) => /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/.test(s);
        
        document.querySelectorAll('table tr').forEach((rowElem, i) => {
             const row = rowElem as HTMLElement;
             const text = row.innerText;
             if (text.length < 10) return; // Skip empty rows
             
             // Check for keywords
             const hasKeywords = /recruitment|vacancy|post|examination|advt|notification/i.test(text);
             // Check for date
             const hasDate = isDate(text);
             
             // Look for links
             const links = Array.from(row.querySelectorAll('a')).map(a => ({
                 text: a.innerText,
                 href: a.href
             }));

             if ((hasKeywords || hasDate) && links.length > 0) {
                 potentialJobs.push({
                     type: 'table-row',
                     text: text.split('\t').join(' ').substring(0, 200), // refined text
                     links: links,
                     raw: text
                 });
             }
        });

        // 2. Scan Ul/Li lists (common in news tickers)
        document.querySelectorAll('ul li, marquee a').forEach((el) => {
             const text = (el as HTMLElement).innerText || '';
             const anchor = el.tagName === 'A' ? el as HTMLAnchorElement : el.querySelector('a');
             
             if (anchor && /recruitment|vacancy|exam/i.test(text)) {
                 potentialJobs.push({
                     type: 'list-item',
                     text: text.substring(0, 200),
                     links: [{ text: anchor.innerText, href: anchor.href }],
                     raw: text
                 });
             }
        });

        return potentialJobs;
    });

    // Extract page title for Organization fallback
    const pageTitle = await page.title();
    
    // Detect State
    const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
        'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
        'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'India'
    ];
    
    const contentText = (pageTitle + ' ' + this.targetUrl).toLowerCase();
    let detectedState = 'India'; // Default
    
    for (const state of states) {
        if (contentText.includes(state.toLowerCase())) {
            detectedState = state;
            break;
        }
    }
    
    // Also check for 'PSC' shortcodes
    const stateMap: Record<string, string> = {
        'bpsc': 'Bihar', 'uppsc': 'Uttar Pradesh', 'ukpsc': 'Uttarakhand', 'mppsc': 'Madhya Pradesh',
        'rpsc': 'Rajasthan', 'tnpsc': 'Tamil Nadu', 'kpsc': 'Karnataka', 'gpsc': 'Gujarat'
    };
    
    for (const [key, val] of Object.entries(stateMap)) {
        if (contentText.includes(key)) {
            detectedState = val;
            break;
        }
    }

    logger.info(`Universal Scraper found ${candidates.length} candidates.`);

    for (const item of candidates) {
        // Post-process in Node.js
        const title = item.text.replace(/\n/g, ' ').trim();
        const mainLink = item.links.find((l: any) => l.href.endsWith('.pdf'))?.href || item.links[0]?.href;

        // Try to find a date
        const dateMatch = item.raw.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/);
        let dateStr = undefined;
        if (dateMatch) {
            try {
                // formatting needed?
                dateStr = new Date(dateMatch[0]).toISOString();
            } catch (e) {}
        }

        if (title && mainLink) {
             notifications.push({
                title: title,
                organization: pageTitle.split(/[-|]/)[0].trim() || 'Government Organization', // First part of title usually
                sourceUrl: this.targetUrl,
                officialPdfUrl: mainLink,
                applyLink: this.targetUrl,
                notificationDate: dateStr,
                location: detectedState,
                id: `uni-${Math.random().toString(36).substr(2, 9)}` // Random ID for now
             });
        }
    }

    return notifications;
  }
}
