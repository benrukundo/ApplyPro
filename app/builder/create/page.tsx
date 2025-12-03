"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  X,
  Loader2,
  Save,
  ZoomIn,
} from "lucide-react";
import ResumePreview from "@/app/components/ResumePreview";
import {
  type ResumeData,
  type WorkExperience,
  type Education,
  type TemplateType,
  loadResumeData,
  saveResumeData,
  initializeResumeData,
  isStepComplete,
  getYearOptions,
  months,
  degreeOptions,
  usStates,
  getSkillSuggestions,
  getJobDescriptionSuggestions,
} from "@/lib/builder";

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const template = (searchParams.get("template") as TemplateType) || "modern";
  const initialStep = parseInt(searchParams.get("step") || "1");
  const hasUpload = searchParams.get("upload") === "true";

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const loaded = loadResumeData();
    return loaded || initializeResumeData(template);
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Experience form state
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  // Education form state
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [showEducationForm, setShowEducationForm] = useState(false);

  // Skill input
  const [skillInput, setSkillInput] = useState("");

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      saveResumeData(resumeData);
      setLastSaved(new Date());
    }, 1000);

    return () => clearTimeout(timer);
  }, [resumeData]);

  // Parse uploaded resume if flagged
  useEffect(() => {
    if (hasUpload) {
      const uploadedText = localStorage.getItem("applypro_resume_upload_text");
      if (uploadedText) {
        // Simple parsing - you can enhance this with AI
        // For now, just store it and let user manually fill
        localStorage.removeItem("applypro_resume_upload_text");
      }
    }
  }, [hasUpload]);

  const updateStep = (step: number) => {
    setCurrentStep(step);
    router.push(`/builder/create?template=${template}&step=${step}`);
  };

  const handleNext = () => {
    if (currentStep < 7) {
      updateStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      updateStep(currentStep - 1);
    }
  };

  const updateHeader = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      header: {
        ...resumeData.header,
        [field]: value,
      },
    });
  };

  const addExperience = (exp: Omit<WorkExperience, "id">) => {
    const newExp: WorkExperience = {
      ...exp,
      id: crypto.randomUUID(),
    };
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExp],
    });
    setShowExperienceForm(false);
    setEditingExperience(null);
  };

  const updateExperience = (id: string, updates: Partial<WorkExperience>) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    });
    setShowExperienceForm(false);
    setEditingExperience(null);
  };

  const deleteExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((exp) => exp.id !== id),
    });
  };

  const addEducation = (edu: Omit<Education, "id">) => {
    const newEdu: Education = {
      ...edu,
      id: crypto.randomUUID(),
    };
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEdu],
    });
    setShowEducationForm(false);
    setEditingEducation(null);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
    });
    setShowEducationForm(false);
    setEditingEducation(null);
  };

  const deleteEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((edu) => edu.id !== id),
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !resumeData.skills.includes(skillInput.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((s) => s !== skill),
    });
  };

  const steps = [
    { number: 1, name: "Header", label: "Contact Info" },
    { number: 2, name: "Experience", label: "Work History" },
    { number: 3, name: "Education", label: "Education" },
    { number: 4, name: "Skills", label: "Skills" },
    { number: 5, name: "Summary", label: "Summary" },
    { number: 6, name: "Additional", label: "Extra Details" },
    { number: 7, name: "Finalize", label: "Review" },
  ];

  const getNextStepName = () => {
    if (currentStep < 7) {
      return steps[currentStep].name;
    }
    return "Complete";
  };

  const canProceed = () => {
    return isStepComplete(resumeData, currentStep);
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* Progress Sidebar */}
      <aside className="hidden lg:block w-80 bg-slate-800 text-white p-8 fixed h-full overflow-y-auto">
        <div className="mb-12">
          <Link href="/" className="text-2xl font-bold">
            ApplyPro.
          </Link>
        </div>

        <nav className="space-y-6">
          {steps.map((step, index) => {
            const completed = isStepComplete(resumeData, step.number);
            const current = currentStep === step.number;

            return (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-4 top-10 h-12 w-0.5 bg-slate-600" />
                )}

                <button
                  onClick={() => completed && updateStep(step.number)}
                  className={`flex items-center gap-4 text-left w-full ${
                    current ? "text-white" : completed ? "text-blue-400" : "text-gray-400"
                  } ${completed ? "cursor-pointer hover:text-white" : "cursor-default"}`}
                  disabled={!completed && !current}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      completed
                        ? "bg-green-500"
                        : current
                        ? "bg-blue-600"
                        : "bg-slate-600"
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : current ? (
                      <span className="text-sm font-semibold">{step.number}</span>
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{step.name}</div>
                    <div className="text-xs text-gray-400">{step.label}</div>
                  </div>
                </button>
              </div>
            );
          })}
        </nav>

        <div className="mt-12 pt-8 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Save className="h-3 w-3" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : null}
          </div>

          <div className="text-xs text-gray-500 space-y-2">
            <Link href="/terms" className="block hover:text-gray-400">
              Terms
            </Link>
            <Link href="/privacy" className="block hover:text-gray-400">
              Privacy Policy
            </Link>
            <Link href="/contact" className="block hover:text-gray-400">
              Contact Us
            </Link>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            © 2025, ApplyPro. All rights reserved.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80">
        <div className="flex min-h-screen">
          {/* Form Area */}
          <div className="w-full lg:w-2/5 p-8 overflow-y-auto">
            <div className="max-w-2xl">
              {/* Sample Data Notice */}
              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Sample Data Included
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      This resume is pre-filled with sample data to help you get started. Simply replace it with your own information as you go through each step.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              {currentStep === 1 && <HeaderStep data={resumeData} updateHeader={updateHeader} />}

              {currentStep === 2 && (
                <ExperienceStep
                  data={resumeData}
                  addExperience={addExperience}
                  updateExperience={updateExperience}
                  deleteExperience={deleteExperience}
                  editingExperience={editingExperience}
                  setEditingExperience={setEditingExperience}
                  showForm={showExperienceForm}
                  setShowForm={setShowExperienceForm}
                />
              )}

              {currentStep === 3 && (
                <EducationStep
                  data={resumeData}
                  addEducation={addEducation}
                  updateEducation={updateEducation}
                  deleteEducation={deleteEducation}
                  editingEducation={editingEducation}
                  setEditingEducation={setEditingEducation}
                  showForm={showEducationForm}
                  setShowForm={setShowEducationForm}
                />
              )}

              {currentStep === 4 && (
                <SkillsStep
                  data={resumeData}
                  skillInput={skillInput}
                  setSkillInput={setSkillInput}
                  addSkill={addSkill}
                  removeSkill={removeSkill}
                />
              )}

              {currentStep === 5 && (
                <SummaryStep
                  data={resumeData}
                  setSummary={(summary: string) => setResumeData({ ...resumeData, summary })}
                />
              )}

              {currentStep === 6 && (
                <AdditionalStep
                  data={resumeData}
                  setResumeData={setResumeData}
                />
              )}

              {currentStep === 7 && <FinalizeStep data={resumeData} template={template} />}

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                {currentStep < 7 ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href="/builder/checkout"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Download Resume
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {canProceed() && currentStep < 7 && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Great progress! Next up → <span className="font-semibold">{getNextStepName()}</span>
                </p>
              )}
            </div>
          </div>

          {/* Preview Area */}
          <div className="hidden lg:block w-3/5 bg-gray-50 dark:bg-gray-950 p-8 overflow-y-auto border-l border-gray-200 dark:border-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Resume Preview
              </h3>
              <div className="flex items-center gap-2">
                <Link
                  href={`/builder/template-select`}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Change template
                </Link>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white hover:bg-orange-600">
                  <ZoomIn className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-gray-100 dark:bg-gray-950 rounded-lg overflow-hidden">
              <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                <div className="flex justify-center p-8">
                  <div style={{ transform: "scale(0.75)", transformOrigin: "top center" }}>
                    <ResumePreview data={resumeData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Preview Button */}
      <button
        onClick={() => setShowPreview(true)}
        className="lg:hidden fixed bottom-6 right-6 flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
      >
        View Preview
      </button>
    </div>
  );
}

// Step Components
function HeaderStep({
  data,
  updateHeader,
}: {
  data: ResumeData;
  updateHeader: (field: string, value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Let's start with your contact information
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        This information will appear at the top of your resume
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={data.header.firstName}
              onChange={(e) => updateHeader("firstName", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="John"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={data.header.lastName}
              onChange={(e) => updateHeader("lastName", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={data.header.email}
              onChange={(e) => updateHeader("email", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={data.header.phone}
              onChange={(e) => updateHeader("phone", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="(555) 123-4567"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={data.header.city || ""}
              onChange={(e) => updateHeader("city", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="San Francisco"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State/Province/Region
            </label>
            <input
              type="text"
              value={data.header.state || ""}
              onChange={(e) => updateHeader("state", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="California, Ontario, Kigali, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            LinkedIn URL
          </label>
          <input
            type="url"
            value={data.header.linkedin || ""}
            onChange={(e) => updateHeader("linkedin", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="https://linkedin.com/in/yourname"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Portfolio/Website
          </label>
          <input
            type="url"
            value={data.header.website || ""}
            onChange={(e) => updateHeader("website", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
    </div>
  );
}

// Experience Step Component (simplified for space - full implementation would be more detailed)
function ExperienceStep({
  data,
  addExperience,
  updateExperience,
  deleteExperience,
  editingExperience,
  setEditingExperience,
  showForm,
  setShowForm,
}: any) {
  const [formData, setFormData] = useState<Partial<WorkExperience>>({
    jobTitle: "",
    employer: "",
    city: "",
    state: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    current: false,
    description: "",
  });

  useEffect(() => {
    if (editingExperience) {
      setFormData(editingExperience);
      setShowForm(true);
    }
  }, [editingExperience, setShowForm]);

  const handleSubmit = () => {
    if (editingExperience) {
      updateExperience(editingExperience.id, formData);
    } else {
      addExperience(formData);
    }
    setFormData({
      jobTitle: "",
      employer: "",
      city: "",
      state: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      current: false,
      description: "",
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Now, let's add your experience
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Add your work history. We have expert samples to guide you.
      </p>

      {/* Existing Experience List */}
      {data.experience.length > 0 && !showForm && (
        <div className="space-y-4 mb-6">
          {data.experience.map((exp: WorkExperience) => (
            <div
              key={exp.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{exp.jobTitle}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{exp.employer}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {exp.startMonth} {exp.startYear} - {exp.current ? "Present" : `${exp.endMonth} ${exp.endYear}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingExperience(exp)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded dark:hover:bg-blue-900/20"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteExperience(exp.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Job Title *"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Employer *"
              value={formData.employer}
              onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="State/Province/Region"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.startMonth}
              onChange={(e) => setFormData({ ...formData, startMonth: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Start Month *</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={formData.startYear}
              onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Start Year *</option>
              {getYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.endMonth}
              onChange={(e) => setFormData({ ...formData, endMonth: e.target.value })}
              disabled={formData.current}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-900"
            >
              <option value="">End Month</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={formData.endYear}
              onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
              disabled={formData.current}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-900"
            >
              <option value="">End Year</option>
              {getYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.checked, endMonth: "", endYear: "" })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              I currently work here
            </label>
          </div>

          <textarea
            placeholder="Describe your responsibilities and achievements"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.jobTitle || !formData.employer || !formData.startMonth || !formData.startYear}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingExperience ? "Update" : "Add"} Position
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingExperience(null);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          <Plus className="h-5 w-5" />
          Add {data.experience.length > 0 ? "another" : ""} position
        </button>
      )}
    </div>
  );
}

// Education Step (complete)
function EducationStep({ data, addEducation, updateEducation, deleteEducation, editingEducation, setEditingEducation, showForm, setShowForm }: any) {
  const [formData, setFormData] = useState<Partial<Education>>({
    school: "",
    location: "",
    degree: "",
    field: "",
    gradMonth: "",
    gradYear: "",
    stillEnrolled: false,
    details: "",
  });
  const [stillEnrolled, setStillEnrolled] = useState(false);

  useEffect(() => {
    if (editingEducation) {
      setFormData(editingEducation);
      setStillEnrolled(editingEducation.stillEnrolled);
      setShowForm(true);
    }
  }, [editingEducation, setShowForm]);

  const handleSubmit = () => {
    if (!formData.school || !formData.degree || !formData.field) return;

    if (editingEducation) {
      updateEducation(editingEducation.id, formData);
    } else {
      addEducation(formData);
    }
    setFormData({
      school: "",
      location: "",
      degree: "",
      field: "",
      gradMonth: "",
      gradYear: "",
      stillEnrolled: false,
      details: "",
    });
    setStillEnrolled(false);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Now, let's add your education
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Add at least one education entry to continue
      </p>

      {/* Existing Education List */}
      {data.education.length > 0 && !showForm && (
        <div className="space-y-4 mb-6">
          {data.education.map((edu: Education) => (
            <div
              key={edu.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{edu.school}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{edu.degree} in {edu.field}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {edu.location} • {edu.stillEnrolled ? "Currently enrolled" : `Graduated ${edu.gradMonth} ${edu.gradYear}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingEducation(edu)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded dark:hover:bg-blue-900/20"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteEducation(edu.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="School Name *"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Location (City, State/Province)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Degree *</option>
              {degreeOptions.map((degree) => (
                <option key={degree} value={degree}>
                  {degree}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Field of Study *"
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.gradMonth}
              onChange={(e) => setFormData({ ...formData, gradMonth: e.target.value })}
              disabled={stillEnrolled}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-900"
            >
              <option value="">Graduation Month</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={formData.gradYear}
              onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
              disabled={stillEnrolled}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 disabled:bg-gray-100 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-900"
            >
              <option value="">Graduation Year</option>
              {getYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={stillEnrolled}
              onChange={(e) => {
                setStillEnrolled(e.target.checked);
                setFormData({ ...formData, stillEnrolled: e.target.checked });
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700 dark:text-gray-300">
              I'm still enrolled
            </label>
          </div>

          <details className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
              + Add course work or other details
            </summary>
            <textarea
              value={formData.details || ""}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Honors, relevant coursework, activities..."
              rows={3}
              className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Pro Tip: Details like honors, clubs, and research projects show employers your growth and learning.
            </p>
          </details>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!formData.school || !formData.degree || !formData.field}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingEducation ? "Update" : "Add"} Education
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingEducation(null);
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          <Plus className="h-5 w-5" />
          Add {data.education.length > 0 ? "another" : ""} education
        </button>
      )}
    </div>
  );
}

// Skills Step (simplified)
function SkillsStep({ data, skillInput, setSkillInput, addSkill, removeSkill }: any) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Time to showcase your skills
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Add at least 3 skills to continue
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {data.skills.map((skill: string) => (
          <span
            key={skill}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
          >
            {skill}
            <button onClick={() => removeSkill(skill)}>
              <X className="h-4 w-4" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addSkill()}
          placeholder="Type a skill and press Enter"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <button
          onClick={addSkill}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// Summary Step (simplified)
function SummaryStep({ data, setSummary }: any) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Add a summary to highlight your best qualities
      </h2>

      <textarea
        value={data.summary || ""}
        onChange={(e) => setSummary(e.target.value)}
        rows={6}
        placeholder="Write a brief professional summary..."
        className="w-full rounded-lg border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

// Additional Step (simplified)
function AdditionalStep({ data, setResumeData }: any) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Want to add more information?
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Optional sections - skip if not needed
      </p>
    </div>
  );
}

// Finalize Step (simplified)
function FinalizeStep({ data, template }: any) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Your resume is ready!
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Review your resume and download when you're ready
      </p>

      <div className="p-6 rounded-lg border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500">
        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Template: {template.charAt(0).toUpperCase() + template.slice(1)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Last edited: {new Date(data.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
