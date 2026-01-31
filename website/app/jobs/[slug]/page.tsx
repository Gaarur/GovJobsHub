import { getJobBySlug, getAllJobs } from '@/lib/jobs';
import Navbar from '@/components/Navbar';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Download } from 'lucide-react';

export async function generateStaticParams() {
  const jobs = getAllJobs();
  return jobs.map((job) => ({
    slug: job.slug,
  }));
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getJobBySlug(slug);

  if (!job) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-400">Job Not Found</h1>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="mb-6">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Link>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
                            Latest
                        </span>
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                             {job.date ? new Date(job.date).toLocaleDateString() : 'Date N/A'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2">
                        {job.title}
                    </h1>
                    <p className="text-xl text-gray-600 font-medium flex items-center gap-2">
                        {job.organization}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                    {job.official_pdf && (
                        <a 
                            href={job.official_pdf} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-xl font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
                        >
                            <Download className="w-4 h-4" /> Download PDF
                        </a>
                    )}
                    {job.apply_link && (
                        <a 
                            href={job.apply_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 border border-transparent rounded-xl font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Apply Online <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                <div className="bg-white/60 p-4 rounded-lg border border-gray-200/60 backdrop-blur-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Vacancies</p>
                    <p className="text-lg font-bold text-gray-900">{job.vacancies || 'N/A'}</p>
                </div>
                <div className="bg-white/60 p-4 rounded-lg border border-gray-200/60 backdrop-blur-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Date</p>
                    <p className="text-lg font-bold text-gray-900">{job.last_date ? new Date(job.last_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="bg-white/60 p-4 rounded-lg border border-gray-200/60 backdrop-blur-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Application Mode</p>
                    <p className="text-lg font-bold text-gray-900">Online</p>
                </div>
                <div className="bg-white/60 p-4 rounded-lg border border-gray-200/60 backdrop-blur-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-lg font-bold text-gray-900">India</p>
                </div>
            </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12 overflow-hidden">
            <article className="prose prose-lg max-w-none 
                prose-headings:text-black prose-headings:font-bold 
                prose-p:text-gray-900 prose-p:leading-relaxed 
                prose-a:text-blue-700 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                prose-li:text-gray-900
                prose-strong:text-black
                prose-hr:border-gray-200">
                <ReactMarkdown>{job.content}</ReactMarkdown>
            </article>
        </div>
      </main>
    </div>
  );
}
