import { JobNotification } from './types';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

export class MarkdownGenerator {
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public async generate(job: JobNotification): Promise<void> {
    const slug = job.id || job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `${slug}.md`;
    const filepath = path.join(this.outputDir, filename);

    // Skip if file exists and applicationLastDate is same (simple duplicate check)
    // For production, we might want to check hash of content
    if (fs.existsSync(filepath)) {
        // Read existing file to check for updates?
        // For now, overwrite is fine or skip. Let's overwrite to ensure latest data.
        logger.info(`Updating existing job post: ${filename}`);
    }

    const content = this.formatJobPost(job);
    fs.writeFileSync(filepath, content);
    logger.info(`Generated job post: ${filename}`);
  }

  private formatJobPost(job: JobNotification): string {
    const year = new Date().getFullYear(); // Or parse from date
    
    return `---
title: "${job.title}"
date: "${job.notificationDate || new Date().toISOString()}"
organization: "${job.organization}"
location: "${job.location || 'India'}"
source_url: "${job.sourceUrl}"
apply_link: "${job.applyLink}"
official_pdf: "${job.officialPdfUrl}"
vacancies: "${job.vacancies || 'See Notification'}"
last_date: "${job.applicationLastDate || 'See Notification'}"
---

# ${job.title} – ${year}

## Overview
**${job.organization}** has released a recruitment notification.
**Location**: ${job.location || 'India'}

## Organization
${job.organization}

## Key Details
- **Total Vacancies**: ${job.vacancies || 'Not specified in summary'}
- **Job Location**: ${job.location || 'India / State-wise'}
- **Mode of Application**: Online

## Important Dates
- **Notification Date**: ${job.notificationDate ? new Date(job.notificationDate).toDateString() : 'See Notification'}
- **Application Start Date**: ${job.applicationStartDate ? new Date(job.applicationStartDate).toDateString() : 'See Notification'}
- **Last Date to Apply**: ${job.applicationLastDate ? new Date(job.applicationLastDate).toDateString() : 'See Notification'}

## Eligibility
- **Educational Qualification**: ${job.eligibility || 'Check Official Notification'}
- **Age Limit**: Check Official Notification

## Selection Process
- As per official rules (Written / Interview).

## How to Apply
1. Visit the official website: [Click Here](${job.sourceUrl})
2. Read the notification carefully.
3. Click on "Apply Online" if eligible.
4. Fill the form and pay the fee.

## Important Links
- **[Official Notification (PDF)](${job.officialPdfUrl || job.sourceUrl})**
- **[Apply Online](${job.applyLink || job.sourceUrl})**
- **[Official Website](${job.sourceUrl})**

`;
  }
}
