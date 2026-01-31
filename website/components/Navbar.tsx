import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                GovJobs<span className="font-light text-gray-500">Hub</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center">
            <span className="hidden md:inline-flex text-sm text-gray-500 mr-4">
              Automated • Accurate • Fast
            </span>
            <Link 
                href="/about" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
                About
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
