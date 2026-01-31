import { MarkdownGenerator } from '../core/generator';
import { JobNotification } from '../core/types';
import * as path from 'path';

const generator = new MarkdownGenerator(path.resolve('content/jobs'));

const sampleJob: JobNotification = {
  title: 'Assistant Engineer (Civil) Exam-2025',
  organization: 'Uttar Pradesh Public Service Commission (UPPSC)',
  notificationDate: new Date().toISOString(),
  applicationStartDate: '2026-01-01',
  applicationLastDate: '2026-02-01',
  vacancies: '150',
  location: 'Uttar Pradesh',
  eligibility: 'B.E./B.Tech in Civil Engineering',
  sourceUrl: 'https://uppsc.up.nic.in/CandidatePages/Notifications.aspx',
  officialPdfUrl: 'https://uppsc.up.nic.in/View_Advertisement.aspx?ID=Sample',
  applyLink: 'https://uppsc.up.nic.in/CandidatePages/Notifications.aspx',
  id: 'uppsc-sample-ae-civil-2025'
};

generator.generate(sampleJob).then(() => {
  console.log('Sample job created.');
});
