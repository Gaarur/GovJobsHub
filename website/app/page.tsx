import { getAllJobs } from '@/lib/jobs';
import JobDashboard from '@/components/JobDashboard';
import Navbar from '@/components/Navbar';

export default function Home() {
  const jobs = getAllJobs();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-white relative border-b border-gray-200 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto text-center z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100/80 text-blue-700 text-sm font-semibold mb-6 border border-blue-200">
                 Official Government Notifications
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
                Latest Government Jobs
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">Verified & Automated</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Directly fetched from official sources like UPSC, UPPSC, and SSC. No spam, just notifications.
            </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
        <JobDashboard initialJobs={jobs} />
      </main>


      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} GovJobsHub. Built with automation.</p>
        </div>
      </footer>
    </div>
  );
}
