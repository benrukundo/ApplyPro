 'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { generatePDFFromStructure, generateDOCXFromStructure, type ColorPreset, type ResumeStructure } from '@/lib/documentGenerator';
import Link from 'next/link';
import {
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
  Palette,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
} from 'lucide-react';
import { trackEvent } from '@/components/PostHogProvider';
import SkillAutocomplete from '@/app/components/SkillAutocomplete';

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
  monthlyUsageCount?: number;
  monthlyLimit?: number;
  remainingGenerations?: number;
  currentPeriodEnd?: string;
  cancelledAt?: string;
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

const TEMPLATES = [
  { id: 'modern', name: 'Modern', description: 'Clean two-column layout with color accents' },
  { id: 'traditional', name: 'Traditional', description: 'Classic single-column professional style' },
  { id: 'ats', name: 'ATS-Optimized', description: 'Simple format optimized for applicant tracking systems' },
];

const COLOR_PRESETS = [
  { key: 'blue' as ColorPreset, name: 'Blue', hex: '#2563eb', bg: 'bg-blue-600' },
  { key: 'green' as ColorPreset, name: 'Green', hex: '#16a34a', bg: 'bg-green-600' },
  { key: 'purple' as ColorPreset, name: 'Purple', hex: '#9333ea', bg: 'bg-purple-600' },
  { key: 'red' as ColorPreset, name: 'Red', hex: '#dc2626', bg: 'bg-red-600' },
  { key: 'teal' as ColorPreset, name: 'Teal', hex: '#0d9488', bg: 'bg-teal-600' },
  { key: 'orange' as ColorPreset, name: 'Orange', hex: '#ea580c', bg: 'bg-orange-600' },
];

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

function BuildResumeContent() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [builderId, setBuilderId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'traditional' | 'ats'>('modern');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);

  // Template prefill state (from resume examples)
  const searchParams = useSearchParams();
  const templateSlug = searchParams?.get('template');
  const categorySlug = searchParams?.get('category');

  const [templateInfo, setTemplateInfo] = useState<{
    title: string;
    industry: string;
    summary?: string;
    skills?: string[];
    writingTips?: string[];
    experienceLevel?: string;
  } | null>(null);

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
    setIsLoadingSubscription(true);
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      } else {
        setSubscription({ plan: null, isActive: false });
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
      setSubscription({ plan: null, isActive: false });
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  // Load template prefill when template/category are present
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateSlug || !categorySlug) return;
      try {
        const res = await fetch(`/api/examples/prefill?template=${templateSlug}&category=${categorySlug}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.success) {
          setTemplateInfo(data.data);
          setFormData(prev => ({
            ...prev,
            targetJobTitle: data.data.title || prev.targetJobTitle,
            targetIndustry: data.data.industry || prev.targetIndustry,
            experienceLevel: data.data.experienceLevel === 'ENTRY' ? 'entry' : data.data.experienceLevel === 'MID' ? 'mid' : 'senior',
            skills: {
              ...prev.skills,
              technical: data.data.skills?.slice(0, 6) || prev.skills.technical,
            },
          }));
        }
      } catch (err) {
        console.error('Error loading template:', err);
      }
    };
    loadTemplate();
  }, [templateSlug, categorySlug]);

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
        
        return true;

      case 6:
        return true;

      default:
        return true;
    }
  };

  const handleGeneratePreview = async () => {
    if (!session?.user?.id) {
      router.push('/login?callbackUrl=/build-resume');
      return;
    }

    setIsGeneratingPreview(true);
    setError('');

    try {
      const response = await fetch('/api/build-resume/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate preview');
      }

      const data = await response.json();
      setEnhancedPreview(data.content);

      trackEvent('builder_preview_generated', {
        target_job: formData.targetJobTitle,
        has_subscription: canDownload,
      });
    } catch (err) {
      console.error('Preview generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate preview. Please try again.');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // Helper function to format date
  const formatMonthYear = (dateStr: string): string => {
    if (!dateStr) return '';
    
    if (dateStr.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = dateStr.split('-');
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }
    
    return dateStr;
  };

  // Build ResumeStructure directly from formData
  const buildStructureFromFormData = (): ResumeStructure => {
    const properCapitalize = (text: string): string => {
      if (!text) return '';
      
      const acronyms = ['ICT', 'IT', 'CEO', 'CTO', 'CFO', 'MBA', 'PhD', 'MSc', 'BSc', 'BA', 'MA', 'HR', 'UI', 'UX', 'API', 'SQL', 'AWS', 'GCP', 'MVP'];
      const lowercaseWords = ['of', 'in', 'and', 'the', 'for', 'to', 'a', 'an', 'on', 'at', 'by', 'with'];
      const specialWords: Record<string, string> = {
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'linkedin': 'LinkedIn',
        'github': 'GitHub',
      };
      
      return text.split(' ').map((word, index) => {
        const lowerWord = word.toLowerCase();
        const upperWord = word.toUpperCase();
        
        if (specialWords[lowerWord]) return specialWords[lowerWord];
        if (acronyms.includes(upperWord)) return upperWord;
        if (index > 0 && lowercaseWords.includes(lowerWord)) return lowerWord;
        
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
    };

    const cleanBulletPoints = (bullets: string[]): string[] => {
      return bullets.filter(bullet => {
        const cleaned = bullet.trim().toLowerCase();
        if (bullet.length < 20) return false;
        if (cleaned.match(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}$/i)) return false;
        if (cleaned.match(/^\d{4}$/)) return false;
        return true;
      });
    };

    let summary = formData.summary || '';
    
    if (enhancedPreview || generatedResume) {
      const aiContent = enhancedPreview || generatedResume || '';
      const summaryMatch = aiContent.match(/##\s*PROFESSIONAL\s*SUMMARY\s*\n([\s\S]*?)(?=##|$)/i);
      if (summaryMatch) {
        summary = summaryMatch[1].trim();
      }
    }

    const enhancedExperience = formData.experience.map(exp => {
      let achievements: string[] = [];
      
      if (enhancedPreview || generatedResume) {
        const aiContent = enhancedPreview || generatedResume || '';
        const companyEscaped = exp.company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const jobPattern = new RegExp(`${companyEscaped}[\\s\\S]*?(?=\\n##|\\n\\*\\*[A-Z][a-z]+\\s+[A-Z]|$)`, 'i');
        const jobMatch = aiContent.match(jobPattern);
        
        if (jobMatch) {
          const bullets = jobMatch[0].match(/[-]\s*([^\n]+)/g);
          if (bullets && bullets.length > 0) {
            achievements = bullets
              .map(b => b.replace(/^[-]\s*/, '').trim())
              .filter(b => b.length > 20);
          }
        }
      }
      
      if (achievements.length === 0 && exp.description) {
        achievements = exp.description
          .split(/[\n.]+/)
          .map(line => line.replace(/^[-*]\s*/, '').trim())
          .filter(line => line.length > 20);
      }

      achievements = cleanBulletPoints(achievements);

      const startFormatted = formatMonthYear(exp.startDate);
      const endFormatted = exp.current ? 'Present' : formatMonthYear(exp.endDate);
      const period = startFormatted && endFormatted ? `${startFormatted} - ${endFormatted}` : '';

      return {
        title: properCapitalize(exp.title),
        company: properCapitalize(exp.company),
        location: properCapitalize(exp.location),
        period: period,
        achievements: achievements,
      };
    });

    const education = formData.education.map(edu => {
      const startFormatted = formatMonthYear(edu.startDate);
      const endFormatted = edu.current ? 'Present' : formatMonthYear(edu.endDate);
      const period = startFormatted && endFormatted ? `${startFormatted} - ${endFormatted}` : '';

      let degree = properCapitalize(edu.degree.trim());
      if (edu.field && edu.field.trim()) {
        degree = `${degree} in ${properCapitalize(edu.field.trim())}`;
      }

      return {
        degree: degree,
        school: properCapitalize(edu.school),
        period: period,
        details: edu.highlights || (edu.gpa ? `GPA: ${edu.gpa}` : undefined),
      };
    });

    const structure: ResumeStructure = {
      name: properCapitalize(formData.fullName),
      contact: {
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        location: properCapitalize(formData.location),
        linkedin: formData.linkedin,
        portfolio: formData.portfolio,
      },
      summary: summary,
      experience: enhancedExperience,
      education: education,
      skills: {
        technical: formData.skills.technical,
        soft: formData.skills.soft,
        languages: formData.skills.languages,
      },
    };

    return structure;
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    if (!session?.user?.id) {
      setError('Please sign in to download your resume.');
      router.push('/login?callbackUrl=/build-resume');
      return;
    }

    if (isLoadingSubscription) {
      setError('Loading subscription info. Please wait...');
      return;
    }

    if (!subscription || subscription.isActive !== true) {
      setError('No active subscription found. Please subscribe to download your resume.');
      return;
    }

    if ((subscription.remainingGenerations ?? 0) <= 0) {
      setError('You have used all your resume generations. Please upgrade or wait for your limit to reset.');
      return;
    }

    const resumeContent = enhancedPreview || generatedResume;
    
    if (!resumeContent) {
      setError('No resume to download. Please generate a preview first.');
      return;
    }

    setIsDownloading(true);
    setError('');

    try {
      const verifyResponse = await fetch('/api/user/subscription');
      if (!verifyResponse.ok) {
        throw new Error('Failed to verify subscription. Please try again.');
      }

      const verifyData = await verifyResponse.json();
      if (!verifyData.subscription?.isActive || (verifyData.subscription?.remainingGenerations ?? 0) <= 0) {
        setError('Your subscription is not active or you have no remaining generations. Please upgrade.');
        setIsDownloading(false);
        return;
      }

      const structure = buildStructureFromFormData();
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${formData.fullName.replace(/\s+/g, '_')}_Resume_${timestamp}`;

      if (format === 'pdf') {
        const blob = await generatePDFFromStructure(structure, selectedTemplate, selectedColor.key);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const blob = await generateDOCXFromStructure(structure, selectedTemplate, selectedColor.key);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      trackEvent('builder_resume_downloaded', {
        format,
        template: selectedTemplate,
        color: selectedColor.key,
        target_job: formData.targetJobTitle,
      });

      await loadSubscription();
    } catch (err) {
      console.error('Download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download. Please try again.');
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

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
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

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
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

  const canDownload =
    subscription?.isActive === true &&
    (subscription?.remainingGenerations ?? 0) > 0 &&
    !isLoadingSubscription;

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Resume Builder</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Build Your Resume From Scratch</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            No resume? No problem. We&apos;ll guide you step by step.
          </p>

          {/* Subscription Status */}
          {session?.user && !isLoadingSubscription && (
            <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              canDownload ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {canDownload ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Active Subscription • {subscription?.remainingGenerations ?? 0} downloads remaining</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {subscription?.isActive
                      ? `No remaining downloads (${subscription?.monthlyUsageCount ?? 0}/${subscription?.monthlyLimit ?? 0} used)`
                      : 'No active subscription'} • <Link href="/pricing" className="underline font-medium hover:text-amber-800">Subscribe now</Link>
                  </span>
                </>
              )}
            </div>
          )}

          {isLoadingSubscription && session?.user && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-blue-100 text-blue-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading subscription...</span>
            </div>
          )}

          {/* Template Info Banner */}
          {templateInfo && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Using Template: {templateInfo.title}</h3>
                  <p className="text-sm text-blue-700 mt-1">Industry: {templateInfo.industry}</p>
                  {templateInfo.writingTips && templateInfo.writingTips.length > 0 && (
                    <div className="mt-3 p-3 bg-white/60 rounded-lg">
                      <p className="text-xs font-medium text-blue-800 mb-2">💡 Writing Tips:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {templateInfo.writingTips.slice(0, 3).map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Steps - Modern Stepper */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Step Counter */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {STEPS[currentStep - 1]?.title}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          
          {/* Step Icons */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isClickable = step.id <= currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  {/* Step Circle */}
                  <button
                    onClick={() => isClickable && goToStep(step.id)}
                    disabled={!isClickable}
                    className={`relative flex flex-col items-center group ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                          : isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100'
                          : 'bg-gray-100 text-gray-400'
                      } ${isClickable && !isActive ? 'hover:scale-105' : ''}`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    
                    {/* Label - Hidden on mobile */}
                    <span
                      className={`hidden md:block text-xs font-medium mt-2 transition-colors ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                  
                  {/* Connector Line */}
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 md:mx-3">
                      <div
                        className={`h-full transition-colors duration-300 rounded-full ${
                          currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto-save indicator */}
        {session?.user && (
          <div className="mb-4 flex items-center justify-center gap-2 text-sm text-gray-500">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          {/* Step 1: Target Role */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">What job are you looking for?</h2>
                <p className="text-gray-600">This helps us tailor your resume to your goals.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Job Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.targetJobTitle}
                    onChange={(e) => setFormData({ ...formData, targetJobTitle: e.target.value })}
                    placeholder="e.g., Software Engineer, Marketing Manager, Nurse"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={formData.targetIndustry}
                  onChange={(e) => setFormData({ ...formData, targetIndustry: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all appearance-none bg-white"
                >
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Experience Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {EXPERIENCE_LEVELS.map(level => (
                    <button
                      key={level.value}
                      onClick={() => setFormData({ ...formData, experienceLevel: level.value })}
                      className={`px-4 py-4 rounded-xl border-2 text-left transition-all ${
                        formData.experienceLevel === level.value
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md shadow-blue-500/10'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{level.label}</span>
                        {formData.experienceLevel === level.value && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
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
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="New York, NY"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn (optional)
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/johndoe"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio/Website (optional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.portfolio}
                      onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                      placeholder="johndoe.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                    />
                  </div>
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
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                  <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No education added yet</p>
                  <button
                    onClick={addEducation}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Education
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.education.map((edu) => (
                    <div key={edu.id} className="p-6 border-2 border-gray-200 rounded-xl relative bg-gray-50/30">
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Bachelor's, Master's, Associate's..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                            placeholder="Computer Science, Business..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">GPA (optional)</label>
                          <input
                            type="text"
                            value={edu.gpa}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="3.8/4.0"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
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
                              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:bg-gray-100"
                            />
                            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={edu.current}
                                onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addEducation}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
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
                  Add your work history. Don&apos;t worry if you don&apos;t have much — internships, volunteer work, and projects count too!
                </p>
              </div>

              {formData.experience.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No experience added yet</p>
                  <button
                    onClick={addExperience}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {formData.experience.map((exp) => (
                    <div key={exp.id} className="p-6 border-2 border-gray-200 rounded-xl relative bg-gray-50/30">
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                            placeholder="Software Engineer, Barista, Volunteer..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                            placeholder="San Francisco, CA / Remote"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                          />
                        </div>

                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              disabled={exp.current}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:bg-gray-100"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="flex items-center gap-2 text-sm mb-3">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            I currently work here
                          </label>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            What did you do there?
                          </label>
                          <p className="text-xs text-gray-500 mb-2">
                            Describe your responsibilities and achievements. We&apos;ll help polish this!
                          </p>
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            placeholder="I helped customers, managed inventory, worked on projects, achieved results like..."
                            rows={4}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addExperience}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
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
                <p className="text-gray-600">What are you good at? Use the autocomplete to add your skills.</p>
              </div>

              {/* Technical Skills */}
              <SkillAutocomplete
                selectedSkills={formData.skills.technical}
                onAddSkill={(skill: string) => addSkill('technical', skill)}
                onRemoveSkill={(skill: string) => removeSkill('technical', skill)}
                category="technical"
                industry={formData.targetIndustry}
                label="Technical Skills"
                placeholder="Search technical skills (e.g., JavaScript, Python, Excel...)"
                maxSkills={15}
                helperText="Add programming languages, tools, software, and technical competencies."
              />

              {/* Soft Skills */}
              <SkillAutocomplete
                selectedSkills={formData.skills.soft}
                onAddSkill={(skill: string) => addSkill('soft', skill)}
                onRemoveSkill={(skill: string) => removeSkill('soft', skill)}
                category="soft"
                industry={formData.targetIndustry}
                label="Soft Skills"
                placeholder="Search soft skills (e.g., Leadership, Communication...)"
                maxSkills={10}
                helperText="Add interpersonal and transferable skills."
              />

              {/* Languages */}
              <SkillAutocomplete
                selectedSkills={formData.skills.languages}
                onAddSkill={(skill: string) => addSkill('languages', skill)}
                onRemoveSkill={(skill: string) => removeSkill('languages', skill)}
                category="languages"
                label="Languages"
                placeholder="Search languages (e.g., Spanish, French, Mandarin...)"
                maxSkills={6}
                helperText="Add languages you speak (include proficiency level if relevant)."
              />

              {/* Certifications */}
              <SkillAutocomplete
                selectedSkills={formData.skills.certifications}
                onAddSkill={(skill: string) => addSkill('certifications', skill)}
                onRemoveSkill={(skill: string) => removeSkill('certifications', skill)}
                category="certifications"
                label="Certifications & Licenses"
                placeholder="Search certifications (e.g., AWS, PMP, CPA...)"
                maxSkills={10}
                helperText="Add professional certifications, licenses, and credentials."
              />

              {/* Skills Summary */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Skills Summary</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {formData.skills.technical.length} technical • 
                      {formData.skills.soft.length} soft • 
                      {formData.skills.languages.length} languages • 
                      {formData.skills.certifications.length} certifications
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {formData.skills.technical.length + 
                       formData.skills.soft.length + 
                       formData.skills.languages.length + 
                       formData.skills.certifications.length}
                    </p>
                    <p className="text-xs text-blue-600">Total Skills</p>
                  </div>
                </div>
              </div>

              {/* Quick Add Suggested Skills */}
              {formData.targetIndustry && SUGGESTED_SKILLS[formData.targetIndustry] && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Quick Add: Top {formData.targetIndustry} Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_SKILLS[formData.targetIndustry]
                      .filter((skill) => !formData.skills.technical.includes(skill))
                      .slice(0, 8)
                      .map((skill) => (
                        <button
                          key={skill}
                          onClick={() => addSkill('technical', skill)}
                          className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          type="button"
                        >
                          + {skill}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Summary */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Summary</h2>
                <p className="text-gray-600">
                  A brief overview of who you are and what you bring. We&apos;ll auto-generate one for you!
                </p>
              </div>

              <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">AI will generate this</span>
                </div>
                <p className="text-sm text-gray-600">
                  Based on your target role, experience, and skills, we&apos;ll create a compelling summary 
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all resize-none"
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
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Target Role
                  </h3>
                  <p className="text-gray-700">{formData.targetJobTitle || 'Not specified'}</p>
                  {formData.targetIndustry && (
                    <p className="text-sm text-gray-500">{formData.targetIndustry}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Contact
                  </h3>
                  <p className="text-gray-700">{formData.fullName}</p>
                  <p className="text-sm text-gray-500">{formData.email}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    Education
                  </h3>
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

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Experience
                  </h3>
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

                <div className="md:col-span-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[...formData.skills.technical, ...formData.skills.soft, ...formData.skills.languages, ...formData.skills.certifications].map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generate Preview Button */}
              {!enhancedPreview && !generatedResume && (
                <div className="text-center py-8 space-y-4">
                  {!session?.user ? (
                    <div>
                      <p className="text-gray-600 mb-4">Sign in to see your professional resume preview</p>
                      <Link
                        href="/login?callbackUrl=/build-resume"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      >
                        <Lock className="w-5 h-5" />
                        Sign In to Continue
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-4">See how your resume will look professionally formatted</p>
                      <button
                        onClick={handleGeneratePreview}
                        disabled={isGeneratingPreview}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-blue-500/25 transition-all"
                      >
                        {isGeneratingPreview ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Generating Preview...
                          </>
                        ) : (
                          <>
                            <Eye className="w-6 h-6" />
                            Generate Free Preview
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-3">
                        ✨ Free AI-enhanced preview • No subscription required
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Show preview if generated */}
              {(enhancedPreview || generatedResume) && (
                <div className="space-y-6">
                  {/* Template Selection */}
                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-blue-600" />
                      Choose Template & Color
                    </h3>
                    
                    {/* Templates */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {TEMPLATES.map(template => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id as 'modern' | 'traditional' | 'ats')}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            selectedTemplate === template.id
                              ? 'border-blue-600 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{template.description}</div>
                        </button>
                      ))}
                    </div>

                    {/* Colors - Only for Modern template */}
                    {selectedTemplate === 'modern' && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Accent Color</p>
                        <div className="flex gap-2">
                          {COLOR_PRESETS.map(color => (
                            <button
                              key={color.key}
                              onClick={() => setSelectedColor(color)}
                              className={`w-9 h-9 rounded-full ${color.bg} transition-all ${
                                selectedColor.key === color.key
                                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                  : 'hover:scale-105'
                              }`}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resume Preview */}
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                      <span className="font-medium text-gray-700">Resume Preview</span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
                      </span>
                    </div>

                    <div
                      className="bg-white relative select-none p-8 max-h-[600px] overflow-y-auto"
                      style={{ userSelect: 'none' }}
                      onCopy={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {/* Watermark for non-subscribers */}
                      {!canDownload && (
                        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                          <div className="transform -rotate-45 opacity-5 text-blue-600 font-bold text-6xl whitespace-nowrap">
                            SUBSCRIBE TO DOWNLOAD
                          </div>
                        </div>
                      )}

                      {/* Preview Content */}
                      <div className="prose prose-sm max-w-none">
                        <h1 className="text-2xl font-bold mb-1" style={{ color: selectedColor.hex }}>
                          {formData.fullName}
                        </h1>
                        <p className="text-gray-600 mb-4">{formData.targetJobTitle}</p>
                        
                        <div className="text-sm text-gray-500 mb-6">
                          {[formData.email, formData.phone, formData.location].filter(Boolean).join(' • ')}
                        </div>

                        {(enhancedPreview || generatedResume || '').split('\n').map((line, idx) => {
                          const trimmedLine = line.trim();
                          if (!trimmedLine) return null;
                          
                          if (trimmedLine.startsWith('##')) {
                            return (
                              <h2 key={idx} className="text-sm font-bold uppercase tracking-wide mt-6 mb-2" style={{ color: selectedColor.hex }}>
                                {trimmedLine.replace(/^#+\s*/, '')}
                              </h2>
                            );
                          }
                          
                          if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
                            return (
                              <p key={idx} className="text-sm text-gray-700 ml-4 mb-1">
                                • {trimmedLine.replace(/^[-•]\s*/, '')}
                              </p>
                            );
                          }
                          
                          return (
                            <p key={idx} className="text-sm text-gray-700 mb-1">
                              {trimmedLine.replace(/\*\*/g, '')}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Download Options or Upgrade CTA */}
                  {canDownload ? (
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => handleDownload('pdf')}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/25"
                      >
                        {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        Download PDF
                      </button>
                      <button
                        onClick={() => handleDownload('docx')}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-lg shadow-green-500/25"
                      >
                        {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        Download DOCX
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white">
                      <Lock className="w-12 h-12 mx-auto mb-4 opacity-90" />
                      <h3 className="text-xl font-bold mb-2">Unlock Your Resume</h3>
                      <p className="text-blue-100 mb-6 max-w-md mx-auto">
                        Your resume is ready! Subscribe to download it in PDF or DOCX format, 
                        plus get unlimited resume tailoring for specific jobs.
                      </p>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                      >
                        <Sparkles className="w-5 h-5" />
                        View Pricing Plans
                      </Link>
                      <p className="text-blue-200 text-sm mt-4">
                        Starting at just $4.99 for 3 resumes
                      </p>
                    </div>
                  )}

                  {/* Regenerate button */}
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setEnhancedPreview(null);
                        setGeneratedResume(null);
                        handleGeneratePreview();
                      }}
                      disabled={isGeneratingPreview}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      {isGeneratingPreview ? 'Regenerating...' : '↻ Not happy? Regenerate resume'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Previous
            </button>

            {currentStep < 7 && (
              <button
                onClick={nextStep}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all"
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

// Wrap content in Suspense to allow client-side search params to hydrate
export default function BuildResumePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <BuildResumeContent />
    </Suspense>
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
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm group hover:bg-gray-200 transition-colors"
          >
            {skill}
            <button
              onClick={() => onRemove(skill)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
