// app/resume-examples/[categorySlug]/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ level?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;

  const category = await prisma.jobCategory.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    return { title: 'Category Not Found' };
  }

  return {
    title: category.metaTitle || `${category.name} Resume Examples | ApplyPro`,
    description:
      category.metaDescription ||
      `Professional ${category.name.toLowerCase()} resume examples with expert tips and templates.`,
  };
}

async function getCategoryData(slug: string, experienceLevel?: string) {
  const category = await prisma.jobCategory.findUnique({
    where: { slug },
  });

  if (!category) return null;

  const filter: any = { categoryId: category.id, isActive: true };
  if (experienceLevel) {
    filter.experienceLevel = experienceLevel;
  }

  const examples = await prisma.resumeExample.findMany({
    where: filter,
    orderBy: [{ viewCount: 'desc' }, { title: 'asc' }],
  });

  const levelCounts = await prisma.resumeExample.groupBy({
    by: ['experienceLevel'],
    where: { categoryId: category.id, isActive: true },
    _count: true,
  });

  return { category, examples, levelCounts };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  // Await both params and searchParams in Next.js 15+
  const { categorySlug } = await params;
  const { level } = await searchParams;

  const data = await getCategoryData(categorySlug, level);

  if (!data) {
    notFound();
  }

  const { category, examples, levelCounts } = data;

  const experienceLevelLabels: Record<string, string> = {
    ENTRY: 'Entry Level',
    MID: 'Mid Level',
    SENIOR: 'Senior Level',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {category.name} Resume Examples
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
              {category.description}
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="bg-white/10 rounded-full px-4 py-2">
                {examples.length} Professional Examples
              </div>
              <div className="bg-white/10 rounded-full px-4 py-2">
                Expert Tips & Templates
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Level Filter */}
      {levelCounts.length > 1 && (
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Experience Level</h2>
              <Link
                href={`/resume-examples/${category.slug}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !level
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All ({levelCounts.reduce((sum, l) => sum + l._count, 0)})
              </Link>
              {levelCounts.map((levelCount) => (
                <Link
                  key={levelCount.experienceLevel}
                  href={`/resume-examples/${category.slug}?level=${levelCount.experienceLevel}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    level === levelCount.experienceLevel
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {experienceLevelLabels[levelCount.experienceLevel]} ({levelCount._count})
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Examples Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example) => (
            <Link
              key={example.id}
              href={`/resume-examples/${category.slug}/${example.slug}`}
              className="group"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {example.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                    example.experienceLevel === 'ENTRY'
                      ? 'bg-green-100 text-green-700'
                      : example.experienceLevel === 'MID'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                  }`}>
                    {experienceLevelLabels[example.experienceLevel]}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {example.summary}
                </p>

                {example.skills && example.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Key Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {example.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                      {example.skills.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{example.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{example.viewCount} views</span>
                  <span className="text-blue-600 group-hover:underline">
                    View Example →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {examples.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No examples found for this experience level.</p>
            <Link
              href={`/resume-examples/${category.slug}`}
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              View all examples →
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your Own {category.name} Resume
          </h2>
          <p className="text-gray-600 mb-8">
            Use our AI-powered builder with these examples as inspiration.
          </p>
          <Link
            href={examples[0]
              ? `/build-resume?template=${examples[0].slug}&category=${category.slug}`
              : '/build-resume'
            }
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Start Building Now
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
