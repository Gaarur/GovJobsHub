import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the path to the content directory
// WE ARE IN /website, content is in ../content/jobs
const postsDirectory = path.join(process.cwd(), '../content/jobs');

export interface JobPost {
  slug: string;
  title: string;
  date: string;
  organization: string;
  location?: string;
  source_url: string;
  apply_link?: string;
  official_pdf?: string;
  vacancies?: string;
  last_date?: string;
  content: string;
}

export function getAllJobs(): JobPost[] {
  // Check if directory exists (it might not in vercel/prod if not copied)
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allJobsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const slug = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      slug,
      content: matterResult.content,
      ...matterResult.data,
    } as JobPost;
  });

  // Sort posts by date
  return allJobsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getJobBySlug(slug: string): JobPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
      slug,
      content: matterResult.content,
      ...matterResult.data,
    } as JobPost;
  } catch (e) {
    return null;
  }
}
