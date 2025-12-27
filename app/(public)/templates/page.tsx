"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Check, 
  FileText, 
  Palette, 
  Sparkles, 
  Download, 
  Shield, 
  Zap,
  CheckCircle2,
  Eye,
  Star,
  Building2,
  Code2,
  Briefcase,
  Loader2,
} from "lucide-react";

// Color presets for Modern template
const colorPresets = [
  { name: "Blue", primary: "blue", hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-600", accent: "bg-blue-600", ring: "ring-blue-200" },
  { name: "Green", primary: "green", hex: "#16a34a", bg: "bg-green-50", text: "text-green-600", border: "border-green-600", accent: "bg-green-600", ring: "ring-green-200" },
  { name: "Purple", primary: "purple", hex: "#9333ea", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-600", accent: "bg-purple-600", ring: "ring-purple-200" },
  { name: "Red", primary: "red", hex: "#dc2626", bg: "bg-red-50", text: "text-red-600", border: "border-red-600", accent: "bg-red-600", ring: "ring-red-200" },
  { name: "Teal", primary: "teal", hex: "#0d9488", bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-600", accent: "bg-teal-600", ring: "ring-teal-200" },
  { name: "Orange", primary: "orange", hex: "#ea580c", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-600", accent: "bg-orange-600", ring: "ring-orange-200" },
];

const templateInfo = {
  modern: {
    name: "Modern",
    description: "Two-column layout with color accents. Perfect for tech, creative, and startup roles.",
    bestFor: ["Tech", "Marketing", "Design", "Startups"],
    features: ["Customizable colors", "Two-column layout", "Visual hierarchy", "Modern typography"],
    icon: Code2,
    color: "blue",
  },
  traditional: {
    name: "Traditional",
    description: "Classic single-column format. Ideal for corporate, finance, and consulting positions.",
    bestFor: ["Finance", "Legal", "Executive", "Consulting"],
    features: ["Clean layout", "Professional fonts", "Classic structure", "Timeless design"],
    icon: Briefcase,
    color: "gray",
  },
  ats: {
    name: "ATS-Optimized",
    description: "Machine-readable format. Maximizes compatibility with applicant tracking systems.",
    bestFor: ["Large Corporations", "Government", "Healthcare", "Enterprise"],
    features: ["99% ATS compatible", "Simple formatting", "Keyword optimized", "No parsing errors"],
    icon: Building2,
    color: "green",
  },
};

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<"modern" | "traditional" | "ats">("modern");
  const [selectedColor, setSelectedColor] = useState(colorPresets[0]);

  // Redirect logged-in users to the app version with sidebar
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/templates");
    }
  }, [status, session, router]);

  // Show loading state while checking auth or redirecting
  if (status === "loading" || (status === "authenticated" && session)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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

  const currentTemplate = templateInfo[selectedTemplate];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            <span>3 Professional Templates Included</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Professional Resume Templates
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose from 3 professionally designed templates. Each optimized for different industries and application systems.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>ATS-friendly formats</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>PDF & DOCX downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Instant generation</span>
            </div>
          </div>
        </div>

        {/* Template Selector */}
        <div className="grid gap-4 md:grid-cols-3 mb-10">
          {(Object.keys(templateInfo) as Array<keyof typeof templateInfo>).map((key) => {
            const template = templateInfo[key];
            const isSelected = selectedTemplate === key;
            const Icon = template.icon;
            
            const colorClassesMap = {
              blue: { selected: "border-blue-600 bg-blue-50 ring-4 ring-blue-100", icon: "bg-blue-100 text-blue-600", badge: "bg-blue-100 text-blue-700" },
              gray: { selected: "border-gray-600 bg-gray-50 ring-4 ring-gray-200", icon: "bg-gray-100 text-gray-600", badge: "bg-gray-100 text-gray-700" },
              green: { selected: "border-green-600 bg-green-50 ring-4 ring-green-100", icon: "bg-green-100 text-green-600", badge: "bg-green-100 text-green-700" },
            };
            const colorClasses = colorClassesMap[template.color as keyof typeof colorClassesMap];

            return (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`group relative rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                  isSelected
                    ? colorClasses.selected
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
                }`}
              >
                {isSelected && (
                  <div className={`absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full shadow-lg ${
                    template.color === "blue" ? "bg-blue-600" : template.color === "green" ? "bg-green-600" : "bg-gray-600"
                  }`}>
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}

                {/* Template Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  isSelected ? colorClasses.icon : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                }`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Template Mini Preview */}
                <div className={`mb-4 h-24 rounded-lg overflow-hidden border ${
                  isSelected ? "border-gray-300" : "border-gray-200"
                }`}>
                  {key === "modern" && (
                    <div className="h-full flex">
                      <div className={`w-1/3 p-2 ${isSelected ? selectedColor.bg : "bg-blue-50"}`}>
                        <div className={`h-2 w-full rounded mb-1 ${isSelected ? selectedColor.accent : "bg-blue-600"}`} />
                        <div className="h-1 w-3/4 rounded bg-gray-300 mb-2" />
                        <div className="space-y-1">
                          <div className="h-0.5 w-full rounded bg-gray-300" />
                          <div className="h-0.5 w-full rounded bg-gray-300" />
                        </div>
                      </div>
                      <div className="flex-1 p-2 bg-white">
                        <div className="h-1.5 w-1/2 rounded bg-gray-400 mb-2" />
                        <div className="space-y-1">
                          <div className="h-0.5 w-full rounded bg-gray-200" />
                          <div className="h-0.5 w-full rounded bg-gray-200" />
                          <div className="h-0.5 w-3/4 rounded bg-gray-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  {key === "traditional" && (
                    <div className="h-full p-2 bg-white">
                      <div className="h-2 w-1/2 rounded bg-gray-800 mx-auto mb-2" />
                      <div className="h-0.5 w-1/3 rounded bg-gray-400 mx-auto mb-3" />
                      <div className="space-y-1">
                        <div className="h-0.5 w-full rounded bg-gray-300" />
                        <div className="h-0.5 w-full rounded bg-gray-300" />
                        <div className="h-0.5 w-5/6 rounded bg-gray-300" />
                      </div>
                    </div>
                  )}
                  {key === "ats" && (
                    <div className="h-full p-2 bg-white font-mono">
                      <div className="h-1.5 w-1/3 rounded bg-gray-800 mb-1" />
                      <div className="h-0.5 w-1/2 rounded bg-gray-400 mb-2" />
                      <div className="space-y-0.5">
                        <div className="h-0.5 w-full rounded bg-gray-300" />
                        <div className="h-0.5 w-full rounded bg-gray-300" />
                        <div className="h-0.5 w-full rounded bg-gray-300" />
                        <div className="h-0.5 w-4/5 rounded bg-gray-300" />
                      </div>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description}
                </p>

                {/* Best For Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {template.bestFor.slice(0, 3).map((item, i) => (
                    <span 
                      key={i} 
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected ? colorClasses.badge : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
          {/* Preview Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedTemplate === "modern" ? "bg-blue-100 text-blue-600" :
                selectedTemplate === "ats" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
              }`}>
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {currentTemplate.name} Template Preview
                </h2>
                <p className="text-sm text-gray-500">Live preview with sample data</p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
            >
              <Download className="w-4 h-4" />
              Get All Templates
            </Link>
          </div>

          {/* Color Picker - Only show for Modern template */}
          {selectedTemplate === "modern" && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Palette className="w-4 h-4 text-gray-500" />
                  <span>Accent Color:</span>
                </div>
                <div className="flex gap-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor.name === color.name
                          ? `ring-2 ring-offset-2 ${color.ring} scale-110`
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Template Preview */}
          <div className="p-6 bg-gray-100">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" style={{ minHeight: "550px" }}>
              {/* Modern Template Preview */}
              {selectedTemplate === "modern" && (
                <div className="flex min-h-[550px]">
                  {/* Left Sidebar */}
                  <div className={`w-[35%] p-6 ${selectedColor.bg}`}>
                    <div className="mb-6">
                      <h1 className="text-xl font-bold text-gray-900">{sampleData.name}</h1>
                      <p className={`text-sm font-medium ${selectedColor.text} mt-1`}>{sampleData.title}</p>
                      <div className="mt-3 space-y-1 text-xs text-gray-600">
                        {sampleData.email && (
                          <p className="break-all leading-tight">{sampleData.email}</p>
                        )}
                        {sampleData.phone && (
                          <p className="leading-tight">{sampleData.phone}</p>
                        )}
                        {sampleData.location && (
                          <p className="leading-tight">{sampleData.location}</p>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className={`text-xs font-bold ${selectedColor.text} mb-2 tracking-wide`}>SKILLS</h3>
                      <div className="space-y-1.5">
                        {sampleData.skills.slice(0, 6).map((skill, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                            <div className={`h-1.5 w-1.5 rounded-full ${selectedColor.accent}`} />
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-xs font-bold ${selectedColor.text} mb-2 tracking-wide`}>EDUCATION</h3>
                      <div className="space-y-2">
                        {sampleData.education.map((edu, i) => (
                          <p key={i} className="text-xs text-gray-700 leading-relaxed">{edu}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 p-6 relative">
                    {/* Top accent bar */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1.5" 
                      style={{ backgroundColor: selectedColor.hex }} 
                    />
                    
                    <div className="pt-2 space-y-5">
                      <div>
                        <h3 className={`text-xs font-bold ${selectedColor.text} tracking-wide mb-2`}>
                          PROFESSIONAL SUMMARY
                        </h3>
                        <div className="h-px w-full mb-3" style={{ backgroundColor: selectedColor.hex }} />
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {sampleData.summary}
                        </p>
                      </div>

                      <div>
                        <h3 className={`text-xs font-bold ${selectedColor.text} tracking-wide mb-2`}>
                          WORK EXPERIENCE
                        </h3>
                        <div className="h-px w-full mb-3" style={{ backgroundColor: selectedColor.hex }} />
                        <div className="space-y-4">
                          {sampleData.experience.map((exp, i) => (
                            <div key={i} className={`relative pl-4 border-l-2 ${selectedColor.border}`}>
                              <div className={`absolute -left-[5px] top-0 h-2 w-2 rounded-full ${selectedColor.accent}`} />
                              <h4 className="text-sm font-bold text-gray-900">{exp.title}</h4>
                              <p className="text-xs mb-1">
                                <span style={{ color: selectedColor.hex }}>{exp.company}</span>
                                <span className="text-gray-500 italic"> | {exp.period}</span>
                              </p>
                              <ul className="space-y-0.5">
                                {exp.achievements.slice(0, 3).map((achievement, j) => (
                                  <li key={j} className="text-xs text-gray-700">• {achievement}</li>
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
                <div className="p-10 min-h-[550px]">
                  <div className="max-w-2xl mx-auto space-y-5">
                    {/* Header */}
                    <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">{sampleData.name}</h1>
                      <p className="text-sm text-gray-600">
                        {sampleData.email} • {sampleData.phone} • {sampleData.location}
                      </p>
                    </div>

                    {/* Professional Summary */}
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 border-b border-gray-400 pb-1 mb-2 tracking-wide">
                        PROFESSIONAL SUMMARY
                      </h3>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {sampleData.summary}
                      </p>
                    </div>

                    {/* Experience */}
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 border-b border-gray-400 pb-1 mb-2 tracking-wide">
                        EXPERIENCE
                      </h3>
                      <div className="space-y-3">
                        {sampleData.experience.map((exp, i) => (
                          <div key={i}>
                            <h4 className="text-sm font-bold text-gray-900">{exp.title}</h4>
                            <p className="text-xs text-gray-600 italic mb-1">{exp.company} • {exp.period}</p>
                            <ul className="space-y-0.5 ml-3">
                              {exp.achievements.slice(0, 3).map((achievement, j) => (
                                <li key={j} className="text-xs text-gray-700">• {achievement}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education & Skills */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-400 pb-1 mb-2 tracking-wide">
                          EDUCATION
                        </h3>
                        <div className="space-y-1">
                          {sampleData.education.map((edu, i) => (
                            <p key={i} className="text-xs text-gray-700">{edu}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-gray-900 border-b border-gray-400 pb-1 mb-2 tracking-wide">
                          SKILLS
                        </h3>
                        <p className="text-xs text-gray-700">
                          {sampleData.skills.join(" • ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ATS-Optimized Template Preview */}
              {selectedTemplate === "ats" && (
                <div className="p-8 min-h-[550px] font-mono">
                  <div className="space-y-4 text-xs">
                    {/* Header */}
                    <div>
                      <h1 className="text-base font-bold text-gray-900">{sampleData.name.toUpperCase()}</h1>
                      <p className="text-gray-600">{sampleData.email} | {sampleData.phone} | {sampleData.location}</p>
                    </div>

                    {/* Professional Summary */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">PROFESSIONAL SUMMARY</h3>
                      <p className="text-gray-700 leading-relaxed">{sampleData.summary}</p>
                    </div>

                    {/* Work Experience */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">WORK EXPERIENCE</h3>
                      <div className="space-y-3">
                        {sampleData.experience.map((exp, i) => (
                          <div key={i}>
                            <p className="font-bold text-gray-900">{exp.title}</p>
                            <p className="text-gray-600">{exp.company} | {exp.period}</p>
                            <ul className="mt-1 space-y-0.5">
                              {exp.achievements.slice(0, 3).map((achievement, j) => (
                                <li key={j} className="text-gray-700">- {achievement}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">EDUCATION</h3>
                      {sampleData.education.map((edu, i) => (
                        <p key={i} className="text-gray-700">{edu}</p>
                      ))}
                    </div>

                    {/* Skills */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">SKILLS</h3>
                      <p className="text-gray-700">{sampleData.skills.join(", ")}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Template Features */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Features:</span>
              {currentTemplate.features.map((feature, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* What's Included Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: FileText, title: "All 3 Templates", desc: "Modern, Traditional, and ATS-Optimized formats included with every purchase" },
            { icon: Palette, title: "6 Color Themes", desc: "Customize the Modern template with your choice of professional color accents" },
            { icon: Download, title: "PDF & DOCX", desc: "Download in both formats for maximum compatibility with any application" },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-10 text-center text-white">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to Create Your Professional Resume?
          </h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Get instant access to all 3 templates, AI-powered content optimization, and unlimited customization options.
          </p>
          
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm">
            {[
              { icon: Shield, text: "Money-back guarantee" },
              { icon: Zap, text: "Instant download" },
              { icon: Star, text: "All templates included" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-blue-100">
                <item.icon className="w-4 h-4" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Get Started - $4.99 for 3 Resumes
            </Link>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-6 py-4 text-white/90 hover:text-white font-medium transition-colors"
            >
              Try Free Preview First →
            </Link>
          </div>
          <p className="text-blue-200 text-sm mt-4">
            No subscription required • One-time purchase
          </p>
        </div>
      </div>
    </div>
  );
}
