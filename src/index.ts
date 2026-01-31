import { UPSCScraper } from './scrapers/upsc';
import { UPPSCScraper } from './scrapers/uppsc';
import { logger } from './utils/logger';
import { JobNotification } from './core/types';
import * as fs from 'fs';
import * as path from 'path';

import { MarkdownGenerator } from './core/generator';

async function main() {
  logger.info('Starting Job Automation System...');

  const scrapers = [
    new UPSCScraper(),
    new UPPSCScraper()
  ];

  const allJobs: JobNotification[] = [];
  const generator = new MarkdownGenerator(path.resolve('content/jobs'));

  for (const scraper of scrapers) {
    try {
      const jobs = await scraper.scrape();
      allJobs.push(...jobs);
      
      for (const job of jobs) {
        await generator.generate(job);
      }

    } catch (error) {
      logger.error(`Failed to run scraper ${scraper.config.name}`, error);
    }
  }

  logger.info(`Total jobs processed: ${allJobs.length}`);
}

main().catch(e => logger.error('Fatal error in main loop', e));
