'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  FileText,
  Check,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Lock,
  Eye,
  Download,
  Target,
  Save,
  AlertCircle,
} from 'lucide-react';
import { trackEvent } from '@/components/PostHogProvider';
import { generatePDF, generateDOCX } from '@/lib/documentGenerator';

export const dynamic = 'force-dynamic';

// Types
interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa: string;
  highlights: string;
}

interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Skills {
  technical: string[];
  soft: string[];
  languages: string[];
  certifications: string[];
}

interface FormData {
  targetJobTitle: string;
  targetIndustry: string;
  experienceLevel: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  education: Education[];
  experience: Experience[];
  skills: Skills;
  summary: string;
}

interface SubscriptionInfo {
  plan: string | null;
  isActive: boolean;
}

const STEPS = [
  { id: 1, title: 'Target Role', icon: Target, description: 'What job are you looking for?' },
  { id: 2, title: 'Personal Info', icon: User, description: 'Your contact details' },
  { id: 3, title: 'Education', icon: GraduationCap, description: 'Your academic background' },
  { id: 4, title: 'Experience', icon: Briefcase, description: 'Your work history' },
  { id: 5, title: 'Skills', icon: Wrench, description: 'Your abilities & certifications' },
  { id: 6, title: 'Summary', icon: FileText, description: 'Professional summary' },
  { id: 7, title: 'Preview', icon: Eye, description: 'Review & download' },
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
  'Sales', 'Engineering', 'Design', 'Customer Service', 'Operations',
  'Human Resources', 'Legal', 'Consulting', 'Retail', 'Manufacturing',
  'Real Estate', 'Hospitality', 'Non-profit', 'Government', 'Other'
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior Level (6-10 years)' },
  { value: 'executive', label: 'Executive (10+ years)' },
];

const SUGGESTED_SKILLS: Record<string, string[]> = {
  'Technology': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker'],
  'Marketing': ['SEO', 'Google Analytics', 'Social Media', 'Content Marketing', 'Email Marketing', 'PPC'],
  'Sales': ['CRM', 'Salesforce', 'Negotiation', 'Lead Generation', 'Cold Calling', 'Account Management'],
  'Healthcare': ['Patient Care', 'EMR Systems', 'HIPAA', 'Medical Terminology', 'CPR Certified'],
  'Finance': ['Excel', 'Financial Modeling', 'QuickBooks', 'SAP', 'Risk Analysis', 'Bloomberg'],
  'Design': ['Figma', 'Adobe Creative Suite', 'UI/UX', 'Sketch', 'Prototyping', 'Typography'],
  'default': ['Microsoft Office', 'Communication', 'Problem Solving', 'Team Collaboration', 'Time Management'],
};

const initialFormData: FormData = {
  targetJobTitle: '',
  targetIndustry: '',
  experienceLevel: '',
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  portfolio: '',
  education: [],
  experience: [],
  skills: { technical: [], soft: [], languages: [], certifications: [] },
  summary: '',
};

export default function BuildResumePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [builderId, setBuilderId] = useState<string | null>(null);

  // Load saved progress and subscription
  useEffect(() => {
    if (session?.user?.id) {
      loadSavedProgress();
      loadSubscription();
    }
  }, [session?.user?.id]);

  const loadSavedProgress = async () => {
    try {
      const response = await fetch('/api/build-resume/progress');
      if (response.ok) {
        const data = await response.json();
        if (data.builderResume) {
          setBuilderId(data.builderResume.id);
          setCurrentStep(data.builderResume.currentStep || 1);
          
          const saved = data.builderResume;
          setFormData({
            targetJobTitle: saved.targetJobTitle || '',
            targetIndustry: saved.targetIndustry || '',
            experienceLevel: saved.experienceLevel || '',
            fullName: saved.fullName || '',
            email: saved.email || '',
            phone: saved.phone || '',
            location: saved.location || '',
            linkedin: saved.linkedin || '',
            portfolio: saved.portfolio || '',
            education: saved.education ? JSON.parse(saved.education) : [],
            experience: saved.experience ? JSON.parse(saved.experience) : [],
            skills: saved.skills ? JSON.parse(saved.skills) : { technical: [], soft: [], languages: [], certifications: [] },
            summary: saved.summary || '',
          });
          
          if (saved.generatedResume) {
            setGeneratedResume(saved.generatedResume);
          }
        }
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
    }
  };

  const saveProgress = async (step?: number) => {
    if (!session?.user?.id) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/build-resume/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: builderId,
          currentStep: step || currentStep,
          ...formData,
          education: JSON.stringify(formData.education),
          experience: JSON.stringify(formData.experience),
          skills: JSON.stringify(formData.skills),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.id) setBuilderId(data.id);
      }
    } catch (err) {
      console.error('Error saving progress:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const goToStep = (step: number) => {
    saveProgress(step);
    setCurrentStep(step);
    setError('');
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      const next = Math.min(currentStep + 1, 7);
      goToStep(next);
      trackEvent('builder_step_completed', { step: currentStep });
    }
  };

  const prevStep = () => {
    const prev = Math.max(currentStep - 1, 1);
    goToStep(prev);
  };

  const validateCurrentStep = (): boolean => {
    setError('');

    switch (currentStep) {
      case 1:
        if (!formData.targetJobTitle.trim()) {
          setError('Please enter your target job title');
          return false;
        }
        return true;

      case 2:
        if (!formData.fullName.trim()) {
          setError('Please enter your full name');
          return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
          setError('Please enter a valid email address');
          return false;
        }
        return true;

      case 3:
        return true;

      case 4:
        return true;

      case 5:
        const totalSkills = 
          formData.skills.technical.length + 
          formData.skills.soft.length + 
          formData.skills.languages.length +
          formData.skills.certifications.length;
        if (totalSkills < 3) {
          setError('Please add at least 3 skills');
          return false;
        }
        return true;

      case 6:
        return true;

      default:
        return true;
    }
  };

  const handleGenerate = async () => {
    if (!session?.user?.id) {
      router.push('/login?callbackUrl=/build-resume');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/build-resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          builderId,
          formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate resume');
      }

      setGeneratedResume(data.resume);
      trackEvent('builder_resume_generated', {
        target_job: formData.targetJobTitle,
        experience_count: formData.experience.length,
        education_count: formData.education.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate resume');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    if (!generatedResume || !canDownload) return;

    setIsDownloading(true);
    setError('');

    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${formData.fullName.replace(/\s+/g, '_')}_Resume_${timestamp}`;

      if (format === 'pdf') {
        await generatePDF(generatedResume, `${fileName}.pdf`, 'modern', 'blue');
      } else {
        await generateDOCX(generatedResume, `${fileName}.docx`, 'modern', 'blue');
      }

      trackEvent('builder_resume_downloaded', {
        format,
        target_job: formData.targetJobTitle,
      });
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const addEducation = () => {
    const newEntry: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      highlights: '',
    };
    setFormData({ ...formData, education: [...formData.education, newEntry] });
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setFormData({
      ...formData,
      education: formData.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    setFormData({
      ...formData,
      education: formData.education.filter(edu => edu.id !== id),
    });
  };

  const addExperience = () => {
    const newEntry: Experience = {
      id: Date.now().toString(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    };
    setFormData({ ...formData, experience: [...formData.experience, newEntry] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setFormData({
      ...formData,
      experience: formData.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter(exp => exp.id !== id),
    });
  };

  const addSkill = (category: keyof Skills, skill: string) => {
    if (skill.trim() && !formData.skills[category].includes(skill.trim())) {
      setFormData({
        ...formData,
        skills: {
          ...formData.skills,
          [category]: [...formData.skills[category], skill.trim()],
        },
      });
    }
  };

  const removeSkill = (category: keyof Skills, skill: string) => {
    setFormData({
      ...formData,
      skills: {
        ...formData.skills,
        [category]: formData.skills[category].filter(s => s !== skill),
      },
    });
  };

  const canDownload = subscription?.isActive;

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Build Your Resume From Scratch</h1>
          <p className="text-gray-600 mt-2">
            No resume? No problem. We'll guide you step by step.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between overflow-x-auto">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => step.id <= currentStep && goToStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center min-w-[80px] transition-all ${
                    step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto-save indicator */}
        {session?.user && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Progress auto-saved
              </>
            )}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* Step 1: Target Role */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What job are you looking for?</h2>
                <p className="text-gray-600">This helps us tailor your resume to your goals.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Job Title *
                </label>
                <input
                  type="text"
                  value={formData.targetJobTitle}
                  onChange={(e) => setFormData({ ...formData, targetJobTitle: e.target.value })}
                  placeholder="e.g., Software Engineer, Marketing Manager, Nurse"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={formData.targetIndustry}
                  onChange={(e) => setFormData({ ...formData, targetIndustry: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {EXPERIENCE_LEVELS.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setFormData({ ...formData, experienceLevel: level.value })}
                      className={`px-4 py-3 rounded-lg border-2 text-left transition-all ${
                        formData.experienceLevel === level.value
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Contact Information</h2>
                <p className="text-gray-600">How can employers reach you?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="New York, NY"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/johndoe"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio/Website (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="johndoe.com"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Education */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Education</h2>
                <p className="text-gray-600">Add your educational background (optional but recommended).</p>
              </div>

              {formData.education.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                  <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No education added yet</p>
                  <button
                    onClick={addEducation}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Education
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.education.map((edu) => (
                    <div key={edu.id} className="p-6 border-2 border-gray-200 rounded-xl relative">
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">School/University</label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                            placeholder="University of California"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Bachelor's, Master's, Associate's..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                            placeholder="Computer Science, Business..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">GPA (optional)</label>
                          <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="3.8/4.0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="month"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                              disabled={edu.current}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                            />
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={edu.current}
                                onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                                className="rounded"
                              />
                              Current
                            </label>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Highlights (optional)</label>
                          <textarea
                            value={edu.highlights}
                            onChange={(e) => updateEducation(edu.id, 'highlights', e.target.value)}
                            placeholder="Dean's List, relevant coursework, thesis, awards..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addEducation}
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another
                  </button>
                </div>
              )}

              <button
                onClick={nextStep}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip this section →
              </button>
            </div>
          )}

          {/* Step 4: Experience */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Work Experience</h2>
                <p className="text-gray-600">
                  Add your work history. Don't worry if you don't have much – internships, volunteer work, and projects count too!
                </p>
              </div>

              {formData.experience.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No experience added yet</p>
                  <button
                    onClick={addExperience}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.experience.map((exp) => (
                    <div key={exp.id} className="p-6 border-2 border-gray-200 rounded-xl relative">
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company/Organization</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            placeholder="Google, Local Café, Volunteer Org..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                            placeholder="Software Engineer, Barista, Volunteer..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                            placeholder="San Francisco, CA / Remote"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              disabled={exp.current}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-sm mb-3">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                              className="rounded"
                            />
                            I currently work here
                          </label>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            What did you do there?
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            Describe your responsibilities and achievements. We'll help polish this!
                          </p>
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            placeholder="I helped customers, managed inventory, worked on projects, achieved results like..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addExperience}
                    className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another
                  </button>
                </div>
              )}

              <button
                onClick={nextStep}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip this section →
              </button>
            </div>
          )}

          {/* Step 5: Skills */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills & Certifications</h2>
                <p className="text-gray-600">What are you good at? Click suggestions or add your own.</p>
              </div>

              {/* Suggested Skills */}
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-medium text-blue-800 mb-3">
                  Suggested for {formData.targetIndustry || formData.targetJobTitle || 'your role'}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {(SUGGESTED_SKILLS[formData.targetIndustry] || SUGGESTED_SKILLS['default']).map(skill => {
                    const isAdded = formData.skills.technical.includes(skill) || formData.skills.soft.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => !isAdded && addSkill('technical', skill)}
                        disabled={isAdded}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          isAdded
                            ? 'bg-green-200 text-green-800'
                            : 'bg-white text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        {isAdded ? <Check className="w-3 h-3 inline mr-1" /> : <Plus className="w-3 h-3 inline mr-1" />}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <SkillSection
                title="Technical Skills"
                skills={formData.skills.technical}
                onAdd={(skill) => addSkill('technical', skill)}
                onRemove={(skill) => removeSkill('technical', skill)}
                placeholder="e.g., Excel, Python, Photoshop..."
              />

              <SkillSection
                title="Soft Skills"
                skills={formData.skills.soft}
                onAdd={(skill) => addSkill('soft', skill)}
                onRemove={(skill) => removeSkill('soft', skill)}
                placeholder="e.g., Leadership, Communication, Problem Solving..."
              />

              <SkillSection
                title="Languages"
                skills={formData.skills.languages}
                onAdd={(skill) => addSkill('languages', skill)}
                onRemove={(skill) => removeSkill('languages', skill)}
                placeholder="e.g., English (Fluent), Spanish (Intermediate)..."
              />

              <SkillSection
                title="Certifications"
                skills={formData.skills.certifications}
                onAdd={(skill) => addSkill('certifications', skill)}
                onRemove={(skill) => removeSkill('certifications', skill)}
                placeholder="e.g., AWS Certified, Google Analytics, PMP..."
              />
            </div>
          )}

          {/* Step 6: Summary */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Summary</h2>
                <p className="text-gray-600">
                  A brief overview of who you are and what you bring. We'll auto-generate one for you!
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">AI will generate this</span>
                </div>
                <p className="text-sm text-gray-600">
                  Based on your target role, experience, and skills, we'll create a compelling summary 
                  when you generate your resume.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or write your own (optional):
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Motivated professional with experience in..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to let AI generate a summary based on your information.
                </p>
              </div>
            </div>
          )}

          {/* Step 7: Preview */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Generate</h2>
                <p className="text-gray-600">
                  Almost done! Review your information and generate your professional resume.
                </p>
              </div>

              {/* Summary of inputs */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Target Role</h3>
                  <p className="text-gray-700">{formData.targetJobTitle || 'Not specified'}</p>
                  {formData.targetIndustry && (
                    <p className="text-sm text-gray-500">{formData.targetIndustry}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
                  <p className="text-gray-700">{formData.fullName}</p>
                  <p className="text-sm text-gray-500">{formData.email}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                  {formData.education.length > 0 ? (
                    formData.education.map(edu => (
                      <p key={edu.id} className="text-gray-700 text-sm">
                        {edu.degree} {edu.field && `in ${edu.field}`} - {edu.school}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">None added</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                  {formData.experience.length > 0 ? (
                    formData.experience.map(exp => (
                      <p key={exp.id} className="text-gray-700 text-sm">
                        {exp.title} at {exp.company}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">None added</p>
                  )}
                </div>

                <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {[...formData.skills.technical, ...formData.skills.soft, ...formData.skills.languages, ...formData.skills.certifications].map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              {!generatedResume ? (
                <div className="text-center py-8">
                  {!session?.user ? (
                    <div>
                      <p className="text-gray-600 mb-4">Sign in to generate and preview your resume</p>
                      <Link
                        href="/login?callbackUrl=/build-resume"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                      >
                        <Lock className="w-5 h-5" />
                        Sign In to Continue
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Generating Your Resume...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Generate My Resume
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Preview */}
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                      <span className="font-medium text-gray-700">Resume Preview</span>
                      {!canDownload && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Upgrade to download
                        </span>
                      )}
                    </div>
                    <div className="p-6 bg-white max-h-[500px] overflow-y-auto">
                      <div className="whitespace-pre-wrap font-serif text-sm text-gray-800 leading-relaxed">
                        {generatedResume}
                      </div>
                    </div>
                  </div>

                  {/* Download Options */}
                  {canDownload ? (
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => handleDownload('pdf')}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        Download PDF
                      </button>
                      <button
                        onClick={() => handleDownload('docx')}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                      >
                        {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        Download DOCX
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                      <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Upgrade to Download</h3>
                      <p className="text-gray-600 mb-4">
                        Subscribe to download your resume and unlock unlimited tailoring for specific jobs.
                      </p>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
                      >
                        <Sparkles className="w-5 h-5" />
                        View Pricing Plans
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < 7 && (
              <button
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skill Section Component
function SkillSection({
  title,
  skills,
  onAdd,
  onRemove,
  placeholder,
}: {
  title: string;
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
          >
            {skill}
            <button
              onClick={() => onRemove(skill)}
              className="text-gray-500 hover:text-red-500"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
