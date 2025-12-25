// app/api/admin/seed/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jobCategories } from '../../../../prisma/seed-data';

// Sample resume examples (add more from the full seed script)
const resumeExamples = [
  {
    categorySlug: 'information-technology',
    title: 'Software Engineer',
    slug: 'software-engineer',
    experienceLevel: 'MID',
    summary: 'Results-driven Software Engineer with 5+ years of experience designing, developing, and maintaining scalable software solutions. Proficient in full-stack development with expertise in JavaScript, Python, and cloud technologies.',
    bulletPoints: [
      'Developed and maintained 15+ microservices handling 1M+ daily requests with 99.9% uptime',
      'Led migration of legacy monolith to microservices architecture, reducing deployment time by 70%',
      'Implemented CI/CD pipelines using Jenkins and GitHub Actions, cutting release cycles from weeks to hours',
      'Mentored 5 junior developers, conducting code reviews and establishing best practices',
      'Optimized database queries resulting in 40% improvement in application response time',
    ],
    skills: ['JavaScript', 'TypeScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Git', 'Agile/Scrum'],
    metaTitle: 'Software Engineer Resume Example | ApplyPro',
    metaDescription: 'Professional software engineer resume example with ATS-optimized format.',
    salaryRange: '$90,000 - $150,000',
    jobOutlook: '+22% growth by 2030',
    writingTips: [
      'Quantify achievements with metrics',
      'Highlight specific technologies relevant to target role',
      'Include links to GitHub portfolio',
      'Use action verbs: Developed, Implemented, Optimized',
    ],
    commonMistakes: [
      'Listing technologies without context',
      'Focusing on responsibilities instead of achievements',
      'Not customizing resume for each application',
      'Omitting soft skills',
    ],
  },
  {
    categorySlug: 'information-technology',
    title: 'Web Developer',
    slug: 'web-developer',
    experienceLevel: 'MID',
    summary: 'Creative Web Developer with 4+ years of experience building responsive, user-centric websites and web applications. Expert in modern frontend frameworks and UI/UX best practices.',
    bulletPoints: [
      'Designed and developed 30+ responsive websites for clients across various industries',
      'Increased client website traffic by average of 45% through SEO optimization',
      'Reduced page load times by 60% through code optimization and lazy loading',
      'Collaborated with UX designers to implement pixel-perfect designs',
      'Built custom WordPress themes and plugins for enterprise clients',
    ],
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Vue.js', 'WordPress', 'PHP', 'Responsive Design', 'SEO', 'Figma', 'Git'],
    metaTitle: 'Web Developer Resume Example | ApplyPro',
    metaDescription: 'Professional web developer resume example for frontend and full-stack roles.',
    salaryRange: '$60,000 - $120,000',
    jobOutlook: '+8% growth by 2030',
    writingTips: [
      'Include portfolio link with live projects',
      'Quantify impact on client businesses',
      'Highlight both design and technical skills',
      'Mention specific frameworks expertise',
    ],
    commonMistakes: [
      'Not including portfolio',
      'Ignoring mobile-first experience',
      'Omitting client collaboration skills',
      'Not mentioning performance optimization',
    ],
  },
  {
    categorySlug: 'healthcare-medical',
    title: 'Registered Nurse',
    slug: 'registered-nurse',
    experienceLevel: 'MID',
    summary: 'Compassionate Registered Nurse with 5+ years of experience in acute care and emergency medicine. Expert in patient assessment, medication administration, and care coordination.',
    bulletPoints: [
      'Provided direct patient care for 6-8 patients per shift in 30-bed acute care unit',
      'Reduced medication errors by 40% through implementation of barcode scanning system',
      'Trained and mentored 10+ new graduate nurses during preceptorship program',
      'Achieved 95% patient satisfaction scores through empathetic communication',
      'Collaborated with multidisciplinary team to develop care plans for complex patients',
    ],
    skills: ['Patient Assessment', 'Medication Administration', 'IV Therapy', 'EMR (Epic, Cerner)', 'BLS/ACLS Certified', 'Care Coordination', 'Patient Education', 'Critical Thinking', 'HIPAA Compliance'],
    metaTitle: 'Registered Nurse Resume Example | ApplyPro',
    metaDescription: 'Professional RN resume example for nurses.',
    salaryRange: '$60,000 - $95,000',
    jobOutlook: '+6% growth by 2030',
    writingTips: [
      'Include nursing license and certifications',
      'Quantify patient load and satisfaction metrics',
      'Highlight specialized skills and unit experience',
      'Emphasize EMR system proficiency',
    ],
    commonMistakes: [
      'Not including license number',
      'Omitting certifications (BLS, ACLS)',
      'Being vague about patient population',
      'Forgetting continuing education',
    ],
  },
];

export async function POST(request: Request) {
  try {
    // Simple auth - check for secret header
    const authHeader = request.headers.get('x-admin-secret');
    const adminSecret = process.env.ADMIN_SECRET || 'your-secret-key-here';

    if (authHeader !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.skillSuggestion.deleteMany();
    await prisma.resumeExample.deleteMany();
    await prisma.jobCategory.deleteMany();

    console.log('🗑️ Cleared existing data');

    // Seed job categories
    for (const category of jobCategories) {
      await prisma.jobCategory.create({ data: category });
    }
    console.log(`✅ Created ${jobCategories.length} job categories`);

    // Seed resume examples
    for (const example of resumeExamples) {
      const category = await prisma.jobCategory.findUnique({
        where: { slug: example.categorySlug },
      });

      if (category) {
        await prisma.resumeExample.create({
          data: {
            title: example.title,
            slug: example.slug,
            experienceLevel: example.experienceLevel as any,
            summary: example.summary,
            bulletPoints: example.bulletPoints,
            skills: example.skills,
            metaTitle: example.metaTitle,
            metaDescription: example.metaDescription,
            salaryRange: example.salaryRange,
            jobOutlook: example.jobOutlook,
            writingTips: example.writingTips,
            commonMistakes: example.commonMistakes,
            categoryId: category.id,
          },
        });
      }
    }
    console.log(`✅ Created ${resumeExamples.length} resume examples`);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        categories: jobCategories.length,
        examples: resumeExamples.length,
      },
    });
  } catch (error) {
    console.error('❌ Seed failed:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to check seed status
export async function GET() {
  try {
    const categoryCount = await prisma.jobCategory.count();
    const exampleCount = await prisma.resumeExample.count();
    const skillCount = await prisma.skillSuggestion.count();

    return NextResponse.json({
      success: true,
      data: {
        categories: categoryCount,
        examples: exampleCount,
        skills: skillCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
