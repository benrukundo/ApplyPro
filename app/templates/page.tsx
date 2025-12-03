"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, FileText, Lock } from "lucide-react";
import Footer from "../components/Footer";

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<"modern" | "traditional" | "ats">("modern");

  // Sample resume data
  const sampleData = {
    name: "Sarah Johnson",
    title: "Senior Marketing Manager",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    summary: "Results-driven marketing professional with 8+ years of experience leading digital campaigns, managing cross-functional teams, and driving revenue growth through data-driven strategies. Proven track record of increasing engagement by 200% and revenue by 45%.",
    experience: [
      {
        title: "Senior Marketing Manager",
        company: "TechCorp",
        period: "2020-Present",
        achievements: [
          "Led digital campaigns increasing revenue by 45%",
          "Managed team of 6 marketing specialists",
          "Implemented data-driven strategies resulting in 200% engagement increase",
          "Developed content strategy that grew social media following from 10K to 50K"
        ]
      },
      {
        title: "Marketing Specialist",
        company: "StartupCo",
        period: "2016-2020",
        achievements: [
          "Developed social media presence from zero to 50K followers",
          "Created content strategy resulting in 200% engagement increase",
          "Managed $500K annual marketing budget",
          "Launched 3 successful product campaigns"
        ]
      }
    ],
    education: [
      "MBA, Marketing - University of California (2016)",
      "BA, Communications - Boston University (2014)"
    ],
    skills: [
      "Digital Marketing",
      "SEO/SEM",
      "Content Strategy",
      "Google Analytics",
      "Team Leadership",
      "Social Media Marketing",
      "Campaign Management",
      "Data Analysis"
    ]
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Professional Resume Templates
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              Choose from 3 professionally designed templates. Each optimized for different industries and application systems.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Template Selector */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {/* Modern Template Card */}
            <button
              onClick={() => setSelectedTemplate("modern")}
              className={`group relative rounded-2xl border-2 p-6 text-left transition-all ${
                selectedTemplate === "modern"
                  ? "border-blue-600 bg-blue-50 shadow-lg dark:bg-blue-950/20"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              {selectedTemplate === "modern" && (
                <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 shadow-lg">
                  <Check className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                <div className="w-full px-4">
                  <div className="h-3 w-3/4 rounded bg-blue-600 mb-2"></div>
                  <div className="h-2 w-1/2 rounded bg-blue-400 mb-4"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="h-1.5 rounded bg-gray-400"></div>
                      <div className="h-1.5 rounded bg-gray-400"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 rounded bg-gray-400"></div>
                      <div className="h-1.5 rounded bg-gray-400"></div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Modern
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Two-column layout with blue accents. Perfect for tech, creative, and startup roles.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">Best for: Tech, Marketing, Design</span>
              </div>
            </button>

            {/* Traditional Template Card */}
            <button
              onClick={() => setSelectedTemplate("traditional")}
              className={`group relative rounded-2xl border-2 p-6 text-left transition-all ${
                selectedTemplate === "traditional"
                  ? "border-gray-600 bg-gray-50 shadow-lg dark:bg-gray-950/20"
                  : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              {selectedTemplate === "traditional" && (
                <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 shadow-lg">
                  <Check className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                <div className="w-full px-4">
                  <div className="h-3 w-2/3 rounded bg-gray-800 mb-3 mx-auto dark:bg-gray-300"></div>
                  <div className="space-y-2">
                    <div className="h-1.5 w-full rounded bg-gray-600 dark:bg-gray-400"></div>
                    <div className="h-1.5 w-full rounded bg-gray-600 dark:bg-gray-400"></div>
                    <div className="h-1.5 w-5/6 rounded bg-gray-600 dark:bg-gray-400"></div>
                    <div className="h-1.5 w-4/5 rounded bg-gray-600 dark:bg-gray-400"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Traditional
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Classic single-column format. Ideal for corporate, finance, and consulting positions.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">Best for: Finance, Legal, Executive</span>
              </div>
            </button>

            {/* ATS-Optimized Template Card */}
            <button
              onClick={() => setSelectedTemplate("ats")}
              className={`group relative rounded-2xl border-2 p-6 text-left transition-all ${
                selectedTemplate === "ats"
                  ? "border-green-600 bg-green-50 shadow-lg dark:bg-green-950/20"
                  : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              }`}
            >
              {selectedTemplate === "ats" && (
                <div className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-600 shadow-lg">
                  <Check className="h-6 w-6 text-white" />
                </div>
              )}
              <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                <div className="w-full px-4">
                  <div className="h-2.5 w-1/2 rounded bg-gray-800 mb-3 dark:bg-gray-300"></div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full rounded bg-gray-600 dark:bg-gray-400"></div>
                    <div className="h-1.5 w-full rounded bg-gray-600 dark:bg-gray-400"></div>
                    <div className="h-1.5 w-full rounded bg-gray-600 dark:bg-gray-400"></div>
                    <div className="h-1.5 w-4/5 rounded bg-gray-600 dark:bg-gray-400"></div>
                    <div className="h-1.5 w-3/4 rounded bg-gray-600 dark:bg-gray-400"></div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                ATS-Optimized
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Machine-readable format. Maximizes compatibility with applicant tracking systems.
              </p>
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <FileText className="h-4 w-4" />
                <span className="font-semibold">Best for: Large corporations, ATS systems</span>
              </div>
            </button>
          </div>

          {/* Full Preview Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedTemplate === "modern" && "Modern Template Preview"}
                {selectedTemplate === "traditional" && "Traditional Template Preview"}
                {selectedTemplate === "ats" && "ATS-Optimized Template Preview"}
              </h2>
              <Link
                href="/generate"
                className="group flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
                title="Start by uploading your resume"
              >
                <Lock className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Purchase to Download
              </Link>
            </div>

            {/* Modern Template Preview */}
            {selectedTemplate === "modern" && (
              <div className="rounded-xl border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800" style={{ minHeight: "600px" }}>
                <div className="grid gap-8 md:grid-cols-[30%_70%]">
                  {/* Left Sidebar */}
                  <div className="space-y-6 rounded-lg bg-blue-50 p-6 dark:bg-blue-950/20">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sampleData.name}</h1>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{sampleData.title}</p>
                      <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                        <p>{sampleData.email}</p>
                        <p>{sampleData.phone}</p>
                        <p>{sampleData.location}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2">SKILLS</h3>
                      <div className="space-y-1.5">
                        {sampleData.skills.slice(0, 6).map((skill, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2">EDUCATION</h3>
                      <div className="space-y-2">
                        {sampleData.education.map((edu, i) => (
                          <p key={i} className="text-xs text-gray-700 dark:text-gray-300">{edu}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 pb-1 mb-3">
                        PROFESSIONAL SUMMARY
                      </h3>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {sampleData.summary}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 pb-1 mb-3">
                        WORK EXPERIENCE
                      </h3>
                      <div className="space-y-4">
                        {sampleData.experience.map((exp, i) => (
                          <div key={i} className="relative pl-4 border-l-2 border-blue-600">
                            <div className="absolute -left-1.5 top-0 h-3 w-3 rounded-full bg-blue-600"></div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{exp.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{exp.company} | {exp.period}</p>
                            <ul className="mt-2 space-y-1">
                              {exp.achievements.map((achievement, j) => (
                                <li key={j} className="text-xs text-gray-700 dark:text-gray-300">• {achievement}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Traditional Template Preview */}
            {selectedTemplate === "traditional" && (
              <div className="rounded-xl border-2 border-gray-200 bg-white p-12 dark:border-gray-700 dark:bg-gray-800" style={{ minHeight: "600px" }}>
                <div className="space-y-6 max-w-3xl mx-auto">
                  {/* Header */}
                  <div className="text-center border-b-2 border-gray-800 pb-4 dark:border-gray-300">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{sampleData.name}</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sampleData.email} • {sampleData.phone} • {sampleData.location}
                    </p>
                  </div>

                  {/* Professional Summary */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-800 pb-1 mb-3 dark:border-gray-300">
                      PROFESSIONAL SUMMARY
                    </h3>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      {sampleData.summary}
                    </p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-800 pb-1 mb-3 dark:border-gray-300">
                      EXPERIENCE
                    </h3>
                    <div className="space-y-4">
                      {sampleData.experience.map((exp, i) => (
                        <div key={i}>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">{exp.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 italic">{exp.company} • {exp.period}</p>
                          <ul className="mt-2 space-y-1 ml-4">
                            {exp.achievements.map((achievement, j) => (
                              <li key={j} className="text-xs text-gray-700 dark:text-gray-300">• {achievement}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-800 pb-1 mb-3 dark:border-gray-300">
                      EDUCATION
                    </h3>
                    <div className="space-y-1">
                      {sampleData.education.map((edu, i) => (
                        <p key={i} className="text-xs text-gray-700 dark:text-gray-300">{edu}</p>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-800 pb-1 mb-3 dark:border-gray-300">
                      SKILLS
                    </h3>
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                      {sampleData.skills.join(" • ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ATS-Optimized Template Preview */}
            {selectedTemplate === "ats" && (
              <div className="rounded-xl border-2 border-gray-200 bg-white p-10 dark:border-gray-700 dark:bg-gray-800" style={{ minHeight: "600px" }}>
                <div className="space-y-5 font-mono text-xs">
                  {/* Header */}
                  <div className="space-y-1">
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">{sampleData.name.toUpperCase()}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{sampleData.email} | {sampleData.phone} | {sampleData.location}</p>
                  </div>

                  {/* Professional Summary */}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">PROFESSIONAL SUMMARY</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{sampleData.summary}</p>
                  </div>

                  {/* Work Experience */}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">WORK EXPERIENCE</h3>
                    <div className="space-y-3">
                      {sampleData.experience.map((exp, i) => (
                        <div key={i}>
                          <p className="font-bold text-gray-900 dark:text-white">{exp.title}</p>
                          <p className="text-gray-600 dark:text-gray-400">{exp.company} | {exp.period}</p>
                          <ul className="mt-1 space-y-0.5">
                            {exp.achievements.map((achievement, j) => (
                              <li key={j} className="text-gray-700 dark:text-gray-300">• {achievement}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">EDUCATION</h3>
                    <div className="space-y-1">
                      {sampleData.education.map((edu, i) => (
                        <p key={i} className="text-gray-700 dark:text-gray-300">{edu}</p>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">SKILLS</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      {sampleData.skills.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-8 dark:from-blue-950/20 dark:to-indigo-950/20">
              <p className="text-center text-lg font-semibold text-gray-900 dark:text-white">
                Ready to create your professional resume?
              </p>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
              >
                Get Started - $4.99 for 3 Resumes
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All 3 templates included • Instant download • No subscription
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
