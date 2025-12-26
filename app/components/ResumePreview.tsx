"use client";

import { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Mail, 
  Phone, 
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  ChevronRight
} from 'lucide-react';
import { useAnalytics } from '@/lib/useAnalytics';

interface ResumePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  example: {
    title: string;
    summary: string;
    bulletPoints: string[];
    skills: string[];
    experienceLevel: string;
    category: {
      name: string;
    };
  };
  onUseTemplate?: () => void;
}

export default function ResumePreview({ 
  isOpen, 
  onClose, 
  example,
  onUseTemplate 
}: ResumePreviewProps) {
  const [zoom, setZoom] = useState(100);
  const { track } = useAnalytics();

  useEffect(() => {
    if (isOpen && (example as any).slug) {
      track({
        event: 'example_preview',
        exampleSlug: (example as any).slug,
        exampleTitle: example.title,
        categorySlug: (example as any).category?.slug,
        categoryName: example.category.name,
      });
    }
  }, [isOpen, example, track]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  // Generate sample data based on the example
  const sampleName = "Alex Johnson";
  const sampleEmail = "alex.johnson@email.com";
  const samplePhone = "(555) 123-4567";
  const sampleLocation = "San Francisco, CA";

  // Generate sample experience based on title
  const generateExperience = () => {
    const currentYear = new Date().getFullYear();
    return [
      {
        title: example.title,
        company: "Tech Solutions Inc.",
        location: "San Francisco, CA",
        period: `${currentYear - 3} - Present`,
        bullets: example.bulletPoints.slice(0, 3),
      },
      {
        title: `Junior ${example.title.replace('Senior ', '').replace('Lead ', '')}`,
        company: "StartUp Co.",
        location: "San Jose, CA",
        period: `${currentYear - 5} - ${currentYear - 3}`,
        bullets: example.bulletPoints.slice(3, 5).length > 0 
          ? example.bulletPoints.slice(3, 5)
          : ["Contributed to team projects and learned industry best practices", "Collaborated with senior team members on key initiatives"],
      },
    ];
  };

  // Generate sample education
  const generateEducation = () => {
    const baseYear = new Date().getFullYear() - 6;
    
    if (example.category.name.includes('Healthcare') || example.category.name.includes('Medical')) {
      return {
        degree: "Bachelor of Science in Nursing",
        school: "University of California, San Francisco",
        period: `${baseYear - 4} - ${baseYear}`,
        details: "Graduated with Honors",
      };
    } else if (example.category.name.includes('Finance') || example.category.name.includes('Accounting')) {
      return {
        degree: "Bachelor of Science in Finance",
        school: "University of California, Berkeley",
        period: `${baseYear - 4} - ${baseYear}`,
        details: "Minor in Accounting, GPA: 3.7",
      };
    } else if (example.category.name.includes('Engineering')) {
      return {
        degree: "Bachelor of Science in Engineering",
        school: "Stanford University",
        period: `${baseYear - 4} - ${baseYear}`,
        details: "Cum Laude",
      };
    } else {
      return {
        degree: "Bachelor of Science in " + example.category.name.split(' ')[0],
        school: "University of California, Berkeley",
        period: `${baseYear - 4} - ${baseYear}`,
        details: "Dean's List",
      };
    }
  };

  const experience = generateExperience();
  const education = generateEducation();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-4 md:inset-8 lg:inset-12 flex flex-col bg-gray-100 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-white border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Resume Preview: {example.title}
            </h2>
            <p className="text-sm text-gray-500">
              This is a sample preview showing how your resume could look
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Use Template Button */}
            {onUseTemplate && (
              <button
                onClick={() => {
                  // track and forward
                  if ((example as any).slug) {
                    track({
                      event: 'example_use_template',
                      exampleSlug: (example as any).slug,
                      exampleTitle: example.title,
                      categorySlug: (example as any).category?.slug,
                      categoryName: example.category.name,
                    });
                  }
                  onUseTemplate();
                }}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Use This Template
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center">
          <div 
            className="bg-white shadow-xl rounded-lg overflow-hidden transition-transform origin-top"
            style={{ 
              transform: `scale(${zoom / 100})`,
              width: '8.5in',
              minHeight: '11in',
              maxWidth: '100%',
            }}
          >
            {/* Resume Content */}
            <div className="p-8 md:p-12">
              {/* Header */}
              <header className="text-center mb-8 pb-6 border-b-2 border-blue-600">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {sampleName}
                </h1>
                <p className="text-lg text-blue-600 font-medium mb-4">
                  {example.title}
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {sampleEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {samplePhone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {sampleLocation}
                  </span>
                </div>
              </header>

              {/* Professional Summary */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <Star className="w-5 h-5 text-blue-600" />
                  Professional Summary
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {example.summary}
                </p>
              </section>

              {/* Experience */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Professional Experience
                </h2>
                
                {experience.map((job, index) => (
                  <div key={index} className={index > 0 ? 'mt-6' : ''}>
                    <div className="flex flex-wrap justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company} • {job.location}</p>
                      </div>
                      <span className="text-sm text-gray-500 font-medium">{job.period}</span>
                    </div>
                    <ul className="list-disc list-outside ml-5 space-y-1.5 text-gray-700">
                      {job.bullets.map((bullet, i) => (
                        <li key={i} className="leading-relaxed">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>

              {/* Education */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  Education
                </h2>
                <div className="flex flex-wrap justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{education.degree}</h3>
                    <p className="text-gray-600">{education.school}</p>
                    {education.details && (
                      <p className="text-sm text-gray-500 mt-1">{education.details}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 font-medium">{education.period}</span>
                </div>
              </section>

              {/* Skills */}
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                  <Star className="w-5 h-5 text-blue-600" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {example.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-4 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center sm:text-left">
              This is a sample preview. Create your own personalized resume using our builder.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              {onUseTemplate && (
                <button
                  onClick={() => {
                    if ((example as any).slug) {
                      track({
                        event: 'example_use_template',
                        exampleSlug: (example as any).slug,
                        exampleTitle: example.title,
                        categorySlug: (example as any).category?.slug,
                        categoryName: example.category.name,
                      });
                    }
                    onUseTemplate();
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Use This Template
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
