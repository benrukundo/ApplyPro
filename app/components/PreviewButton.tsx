'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ResumePreview from './ResumePreview';

interface PreviewButtonProps {
  example: {
    title: string;
    slug: string;
    summary: string;
    bulletPoints: string[];
    skills: string[];
    experienceLevel: string;
    category: {
      name: string;
      slug: string;
    };
  };
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PreviewButton({ 
  example, 
  variant = 'primary',
  size = 'md',
  className = ''
}: PreviewButtonProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const router = useRouter();

  const handleUseTemplate = () => {
    setIsPreviewOpen(false);
    router.push(`/build-resume?template=${example.slug}&category=${example.category.slug}`);
  };

  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all";
  
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline: "border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <>
      <button
        onClick={() => setIsPreviewOpen(true)}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      >
        <Eye className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        Preview
      </button>

      <ResumePreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        example={example}
        onUseTemplate={handleUseTemplate}
      />
    </>
  );
}
