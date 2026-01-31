'use client';

import { useState } from 'react';
import JobCard from '@/components/JobCard';
import { JobPost } from '@/lib/jobs';
import { Search, Loader2, Plus, Globe } from 'lucide-react';

export default function JobDashboard({ initialJobs }: { initialJobs: JobPost[] }) {
  const [jobs, setJobs] = useState<JobPost[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState('');

  // Filter jobs based on search
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    job.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group jobs by location
  const groupedJobs = filteredJobs.reduce((acc, job) => {
    const location = job.location || 'India';
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(job);
    return acc;
  }, {} as Record<string, JobPost[]>);

  // Sort locations: "India" first, then alphabetically
  const sortedLocations = Object.keys(groupedJobs).sort((a, b) => {
    if (a === 'India') return -1;
    if (b === 'India') return 1;
    return a.localeCompare(b);
  });

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl) return;

    setIsScraping(true);
    setScrapeMessage('Analyzing website... this may take 30-60 seconds.');

    try {
        const res = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: scrapeUrl })
        });

        const data = await res.json();
        
        if (data.success) {
            setScrapeMessage(`Success! Found ${data.count} new job(s). Reloading...`);
            // In a real app we would re-fetch data without reload, but for SSG markdown, reloading page is safest to pick up new files
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            setScrapeMessage(`Error: ${data.details || 'Could not find jobs.'}`);
        }
    } catch (err) {
        setScrapeMessage('Failed to connect to scraper service.');
    } finally {
        setIsScraping(false);
    }
  };

  return (
    <div>
      {/* Search & Scrape Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 -mt-8 relative z-20 mx-4 md:mx-0">
         <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search by exam, state, organization..." 
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Scrape Input */}
            <form onSubmit={handleScrape} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                    <Globe className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                    <input 
                        type="url" 
                        placeholder="Paste official notification page URL..." 
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                        value={scrapeUrl}
                        onChange={(e) => setScrapeUrl(e.target.value)}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isScraping}
                    className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-70"
                >
                    {isScraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isScraping ? 'Scraping...' : 'Fetch Jobs'}
                </button>
            </form>
         </div>
         {scrapeMessage && (
             <p className={`mt-3 text-sm font-medium ${scrapeMessage.includes('Success') ? 'text-green-600' : 'text-blue-600'}`}>
                 {scrapeMessage}
             </p>
         )}
      </div>

      {/* Grouped Results */}
      {filteredJobs.length > 0 ? (
        <div className="space-y-12 px-4 md:px-0">
          {sortedLocations.map((location) => (
            <div key={location}>
              {/* Location Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200 shadow-sm">
                    {location}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    ({groupedJobs[location].length} {groupedJobs[location].length === 1 ? 'Job' : 'Jobs'})
                  </span>
                </h2>
                <div className="flex-1 h-px bg-gradient-to-l from-blue-200 to-transparent"></div>
              </div>

              {/* Jobs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedJobs[location].map((job) => (
                  <JobCard key={job.slug} job={job} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 mx-4 md:mx-0">
            <p className="text-gray-500 text-lg">
              {searchQuery ? `No jobs found matching "${searchQuery}".` : 'No jobs available yet.'}
            </p>
        </div>
      )}
    </div>
  );
}
