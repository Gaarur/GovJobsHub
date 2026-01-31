import Link from 'next/link';
import { Calendar, Briefcase, ChevronRight } from 'lucide-react';
import { JobPost } from '@/lib/jobs';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface JobCardProps {
  job: JobPost;
}

export default function JobCard({ job }: JobCardProps) {
  const isRecent = (() => {
      try {
          // If less than 2 days old
          return (new Date().getTime() - new Date(job.date).getTime()) < (2 * 24 * 60 * 60 * 1000);
      } catch { return false; }
  })();

  return (
    <Link 
      href={`/jobs/${job.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 relative overflow-hidden"
    >
      {isRecent && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          NEW
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between items-start">
             <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 mb-1 line-clamp-2 pr-2">
              {job.title}
            </h3>
            {job.location && (
                <span className="shrink-0 inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    {job.location}
                </span>
            )}
        </div>
        <p className="text-sm font-medium text-gray-500 mb-4">{job.organization}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600 gap-2">
           <Briefcase className="w-4 h-4 text-gray-400" />
           <span>{job.vacancies ? `${job.vacancies} Vacancies` : 'Vacancies N/A'}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 gap-2">
           <Calendar className="w-4 h-4 text-gray-400" />
           <span>Last Date: {job.last_date ? new Date(job.last_date).toLocaleDateString() : 'N/A'}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center">
        <span className="text-xs text-gray-400">
           {job.date ? formatDistanceToNow(new Date(job.date), { addSuffix: true }) : ''}
        </span>
        <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          View Details <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
