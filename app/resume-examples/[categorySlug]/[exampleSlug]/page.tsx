import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  generateSEO,
  generateJobPostingSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo';
import PreviewButtonClient from '@/app/components/PreviewButtonClient';

interface Props {
  params: Promise<{ categorySlug: string; exampleSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, exampleSlug } = await params;

  const category = await prisma.jobCategory.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) return { title: 'Not Found' };

  const example = await prisma.resumeExample.findFirst({
    where: { slug: exampleSlug, categoryId: category.id },
  });

  if (!example) return { title: 'Not Found' };

  return generateSEO({
    title: example.metaTitle || `${example.title} Resume Example`,
    description:
      example.metaDescription ||
      `Professional ${example.title} resume example with expert tips. See sample content, skills, and achievements to create your perfect resume.`,
    path: `/resume-examples/${categorySlug}/${exampleSlug}`,
  });
}

async function getExampleData(categorySlug: string, exampleSlug: string) {
  const category = await prisma.jobCategory.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) return null;

  const example = await prisma.resumeExample.findFirst({
    where: { slug: exampleSlug, categoryId: category.id, isActive: true },
  });

  if (!example) return null;

  await prisma.resumeExample.update({
    where: { id: example.id },
    data: { viewCount: { increment: 1 } },
  });

  const relatedExamples = await prisma.resumeExample.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
      id: { not: example.id },
    },
    take: 4,
    orderBy: { viewCount: 'desc' },
  });

  return { category, example, relatedExamples };
}

export default async function ExampleDetailPage({ params }: Props) {
  const { categorySlug, exampleSlug } = await params;

  const data = await getExampleData(categorySlug, exampleSlug);

  if (!data) {
    notFound();
  }

  const { category, example, relatedExamples } = data;

  const experienceLevelLabels: Record<string, string> = {
    ENTRY: 'Entry Level',
    MID: 'Mid Level',
    SENIOR: 'Senior Level',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <JsonLd
        data={generateJobPostingSchema({
          title: example.title,
          summary: example.summary,
          salaryRange: example.salaryRange || undefined,
          category: { name: category.name },
        })}
      />
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Resume Examples', url: '/resume-examples' },
          { name: category.name, url: `/resume-examples/${category.slug}` },
          {
            name: example.title,
            url: `/resume-examples/${category.slug}/${example.slug}`,
          },
        ])}
      />

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{example.title} Resume Example</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">Professional {category.name.toLowerCase()} resume template with expert writing tips</p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="bg-white/10 rounded-full px-4 py-2">{experienceLevelLabels[example.experienceLevel]}</div>
              <div className="bg-white/10 rounded-full px-4 py-2">{example.viewCount} views</div>
              <div className="bg-white/10 rounded-full px-4 py-2">ATS-Optimized</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Summary</h2>
              <p className="text-gray-700 text-lg leading-relaxed">{example.summary}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Achievements & Responsibilities</h2>
              <ul className="space-y-4">
                {example.bulletPoints.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700 leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {example.skills && example.skills.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {example.skills.map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {example.writingTips && example.writingTips.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 Writing Tips</h2>
                <ul className="space-y-3">
                  {example.writingTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3"><span className="text-amber-600 font-bold mt-1">{index + 1}.</span><span className="text-gray-700">{tip}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {example.commonMistakes && example.commonMistakes.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">⚠️ Common Mistakes to Avoid</h2>
                <ul className="space-y-3">
                  {example.commonMistakes.map((mistake, index) => (
                    <li key={index} className="flex items-start gap-3"><span className="text-red-600 mt-1">✗</span><span className="text-gray-700">{mistake}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-blue-600 text-white rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Use This Template</h3>
              <p className="text-blue-100 mb-4">Pre-fill your resume with this professional example.</p>
              <div className="flex flex-col gap-3">
                <PreviewButtonClient
                  example={{
                    title: example.title,
                    slug: example.slug,
                    summary: example.summary,
                    bulletPoints: example.bulletPoints || [],
                    skills: example.skills || [],
                    experienceLevel: example.experienceLevel,
                    category: { name: category.name, slug: category.slug },
                  }}
                  variant="outline"
                  className="w-full"
                />

                <Link href={`/builder?template=${example.slug}&category=${category.slug}`} className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors w-full justify-center">Start Building</Link>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Details</h3>
              <div className="space-y-3">
                <div><span className="text-sm text-gray-500">Category</span><p className="font-medium text-gray-900">{category.name}</p></div>
                <div><span className="text-sm text-gray-500">Experience Level</span><p className="font-medium text-gray-900">{experienceLevelLabels[example.experienceLevel]}</p></div>
                {example.salaryRange && <div><span className="text-sm text-gray-500">Salary Range</span><p className="font-medium text-gray-900">{example.salaryRange}</p></div>}
                {example.jobOutlook && <div><span className="text-sm text-gray-500">Job Outlook</span><p className="font-medium text-gray-900">{example.jobOutlook}</p></div>}
              </div>
            </div>

            {relatedExamples.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Examples</h3>
                <div className="space-y-3">
                  {relatedExamples.map((related) => (
                    <Link key={related.id} href={`/resume-examples/${category.slug}/${related.slug}`} className="block hover:bg-gray-50 p-3 rounded-lg transition-colors">
                      <h4 className="font-medium text-gray-900 line-clamp-2">{related.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{experienceLevelLabels[related.experienceLevel]}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
