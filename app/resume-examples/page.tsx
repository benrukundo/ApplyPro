// app/resume-examples/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Resume Examples by Industry | ApplyPro',
  description:
    'Browse 500+ professional resume examples across 25+ industries. Find the perfect template for your career. ATS-optimized templates.',
};

async function getCategories() {
  const categories = await prisma.jobCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { examples: { where: { isActive: true } } },
      },
      examples: {
        where: { isActive: true },
        take: 3,
        orderBy: { viewCount: 'desc' },
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });
  return categories;
}

export default async function ResumeExamplesPage() {
  const categories = await getCategories();

  // Calculate total examples
  const totalExamples = categories.reduce(
    (sum, cat) => sum + cat._count.examples,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Resume Examples by Industry
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
              Browse {totalExamples}+ professional resume examples across{' '}
              {categories.length} industries. Find inspiration and get hired
              faster.
            </p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="bg-white/10 rounded-full px-4 py-2">
                ✓ ATS-Optimized
              </div>
              <div className="bg-white/10 rounded-full px-4 py-2">
                ✓ Expert-Written
              </div>
              <div className="bg-white/10 rounded-full px-4 py-2">
                ✓ Free to Use
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Browse by Industry
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/resume-examples/${category.slug}`}
              className="group"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-3xl p-2 rounded-lg"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    {category.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category._count.examples} examples
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>

                {/* Popular Examples */}
                <div className="border-t pt-4">
                  <p className="text-xs text-gray-400 mb-2">Popular examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {category.examples.map((example) => (
                      <span
                        key={example.slug}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {example.title}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="mt-4 text-blue-600 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  View all examples
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Build Your Resume?
          </h2>
          <p className="text-gray-600 mb-8">
            Use our AI-powered builder to create a professional resume in
            minutes.
          </p>
          <Link
            href="/builder"
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
