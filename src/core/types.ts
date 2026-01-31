import { z } from 'zod';

export const JobNotificationSchema = z.object({
  title: z.string(),
  organization: z.string(),
  notificationDate: z.string().optional(), // ISO Date string
  applicationStartDate: z.string().optional(),
  applicationLastDate: z.string().optional(),
  vacancies: z.string().nullable().optional(),
  location: z.string().optional(),
  eligibility: z.string().optional(),
  officialPdfUrl: z.string().url().optional(),
  applyLink: z.string().url().optional(),
  sourceUrl: z.string().url(),
  id: z.string().optional(), // Unique ID (hash of title + date)
});

export type JobNotification = z.infer<typeof JobNotificationSchema>;

export interface ScraperConfig {
  id: string;
  name: string;
  baseUrl: string;
  frequency: string; // e.g., 'every 4 hours' (cron syntax or description)
}

export interface IScraper {
  config: ScraperConfig;
  scrape(): Promise<JobNotification[]>;
}
