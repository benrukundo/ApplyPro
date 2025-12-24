"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, CreditCard, Shield, Zap, ArrowLeft } from "lucide-react";

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const faqCategories = [
    {
      id: "general",
      name: "General",
      icon: <HelpCircle className="w-5 h-5" />,
      faqs: [
        {
          question: "How does ApplyPro work?",
          answer:
            "ApplyPro uses advanced AI to analyze your resume and the job description. It then tailors your resume to match the specific requirements, optimizes keywords for ATS systems, and generates a matching cover letter. The entire process takes just minutes.",
        },
        {
          question: "Will this work with ATS systems?",
          answer:
            "Absolutely! Our AI is specifically trained to optimize resumes for Applicant Tracking Systems (ATS). We incorporate relevant keywords, use ATS-friendly formatting, and ensure your resume gets past automated screening to reach human recruiters.",
        },
        {
          question: "What file formats do you support?",
          answer:
            "You can upload your resume as PDF or DOCX. After generation, you can download your tailored resume in both PDF and DOCX formats, ready to submit to any employer.",
        },
        {
          question: "What if I don't have a resume yet?",
          answer:
            "No problem! We offer a free Resume Builder that guides you step-by-step to create a professional resume from scratch. Just click 'Build Resume' to get started.",
        },
        {
          question: "How long does it take to generate a tailored resume?",
          answer:
            "Our AI typically generates your tailored resume, ATS-optimized version, and cover letter in under 60 seconds. Complex resumes with extensive experience may take slightly longer.",
        },
        {
          question: "Can I edit the generated resume?",
          answer:
            "Yes! After generation, you can download your resume as a DOCX file and make any edits you want in Microsoft Word, Google Docs, or any compatible word processor.",
        },
      ],
    },
    {
      id: "pricing",
      name: "Pricing & Billing",
      icon: <CreditCard className="w-5 h-5" />,
      faqs: [
        {
          question: "Can I use ApplyPro for free?",
          answer:
            "Yes! Our free plan includes the ATS Resume Checker, Resume Builder (from scratch), and Job Application Tracker for up to 25 applications. AI-tailored resume generation requires a paid plan.",
        },
        {
          question: "Can I use it multiple times?",
          answer:
            "Yes! With Pro plans, you get up to 100 resume generations per month. Pay-per-use gives you 3 resumes for $4.99. This flexibility lets you tailor your resume for each job application.",
        },
        {
          question: "Can I upgrade from Monthly to Yearly?",
          answer:
            "Yes! You can upgrade anytime. When you upgrade, you'll be charged the prorated difference (yearly price minus credit for unused days on your monthly plan). Your yearly subscription starts immediately.",
        },
        {
          question: "Can I downgrade from Yearly to Monthly?",
          answer:
            "We don't offer direct downgrades. If you're on a yearly plan and prefer monthly billing, you can cancel your yearly subscription. You'll keep full access until your plan expires, then you can subscribe to the monthly plan.",
        },
        {
          question: "How do I cancel my subscription?",
          answer:
            "You can cancel anytime from your dashboard. After canceling, you'll keep full access to all features until the end of your current billing period. No partial refunds are given for unused time.",
        },
        {
          question: "Can I buy Resume Packs with an active subscription?",
          answer:
            "Yes! Resume Packs are separate from your subscription. If you need extra credits beyond your monthly limit, you can purchase Resume Packs anytime. Pack credits are used first before your subscription credits.",
        },
        {
          question: "Do you offer refunds?",
          answer:
            "We offer a 14-day money-back guarantee for yearly subscriptions and 7-day guarantee for monthly subscriptions. Contact support within this period for a full refund. Pay-per-use purchases are non-refundable once used.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and various local payment methods through our secure payment processor.",
        },
        {
          question: "Will my subscription auto-renew?",
          answer:
            "Yes, subscriptions automatically renew at the end of each billing period (monthly or yearly). You'll receive an email reminder before renewal. You can cancel anytime to stop auto-renewal.",
        },
      ],
    },
    {
      id: "features",
      name: "Features",
      icon: <Zap className="w-5 h-5" />,
      faqs: [
        {
          question: "What is the ATS Resume Checker?",
          answer:
            "Our free ATS Resume Checker analyzes your resume against common Applicant Tracking System criteria. It checks for keyword optimization, formatting issues, and provides a compatibility score with suggestions for improvement.",
        },
        {
          question: "How does the Cover Letter Generator work?",
          answer:
            "When you generate a tailored resume, our AI also creates a matching cover letter. It uses information from your resume and the job description to write a personalized letter that highlights your relevant qualifications.",
        },
        {
          question: "What is the Job Application Tracker?",
          answer:
            "The Job Application Tracker helps you organize your job search. You can save job listings, track application status (applied, interviewing, offered, rejected), set follow-up reminders, and keep notes for each application.",
        },
        {
          question: "How does the Interview Prep feature work?",
          answer:
            "Our AI analyzes the job description and generates likely interview questions along with suggested answers based on your resume. This helps you prepare for interviews with relevant, tailored responses.",
        },
        {
          question: "What is the LinkedIn Optimizer?",
          answer:
            "The LinkedIn Optimizer analyzes your profile and provides suggestions to improve your headline, summary, and experience sections. It helps you optimize for recruiter searches and increase profile visibility.",
        },
      ],
    },
    {
      id: "security",
      name: "Privacy & Security",
      icon: <Shield className="w-5 h-5" />,
      faqs: [
        {
          question: "Is my data secure?",
          answer:
            "Yes! We take data security and privacy seriously. Your data is stored securely in encrypted databases and is used only to provide our services to you. We comply with GDPR regulations, which means you have the right to access, modify, or delete your personal data at any time. We never sell your information to third parties.",
        },
        {
          question: "What happens to my data if I cancel?",
          answer:
            "Your data is never deleted! After your subscription expires, you'll keep full access to your account, saved resumes, and generation history. You just won't be able to generate new AI-tailored resumes until you resubscribe. You can still use free features like the ATS checker and resume builder.",
        },
        {
          question: "Can I delete my account and data?",
          answer:
            "Yes, you can request complete account deletion at any time. Contact our support team and we'll permanently delete your account and all associated data within 30 days, as required by GDPR.",
        },
        {
          question: "Do you use my resume data to train AI?",
          answer:
            "No. Your resume data is used solely to provide you with our services. We do not use your personal resume content to train our AI models or share it with third parties.",
        },
      ],
    },
  ];

  const toggleFaq = (categoryId: string, faqIndex: number) => {
    const key = `${categoryId}-${faqIndex}`;
    setOpenFaq(openFaq === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about ApplyPro
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
            >
              {/* Category Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {category.icon}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {category.name}
                  </h2>
                </div>
              </div>

              {/* FAQs */}
              <div className="divide-y divide-gray-100">
                {category.faqs.map((faq, index) => {
                  const isOpen = openFaq === `${category.id}-${index}`;
                  return (
                    <div key={index}>
                      <button
                        onClick={() => toggleFaq(category.id, index)}
                        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900 pr-8">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center bg-blue-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? We're here to help.
          </p>
          <Link
            href="mailto:support@applypro.org"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
