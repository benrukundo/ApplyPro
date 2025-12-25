import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase();
    const category = searchParams.get('category');
    const industry = searchParams.get('industry');
    const limit = parseInt(searchParams.get('limit') || '10');

    // If no query, return popular/suggested skills
    if (!query || query.length < 1) {
      // Get skills from database suggestions
      const skillSuggestions = await prisma.skillSuggestion.findMany({
        where: category ? { category } : undefined,
        orderBy: { name: 'asc' },
        take: 20,
      });

      // Also get popular skills from resume examples in this industry
      let industrySkills: string[] = [];
      if (industry) {
        const examples = await prisma.resumeExample.findMany({
          where: {
            category: {
              name: { contains: industry, mode: 'insensitive' },
            },
            isActive: true,
          },
          select: { skills: true },
          take: 10,
        });

        // Flatten and count skill frequency
        const skillCount: Record<string, number> = {};
        examples.forEach((ex) => {
          ex.skills.forEach((skill) => {
            skillCount[skill] = (skillCount[skill] || 0) + 1;
          });
        });

        // Sort by frequency and get top skills
        industrySkills = Object.entries(skillCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([skill]) => skill);
      }

      return NextResponse.json({
        suggestions: skillSuggestions.map((s) => ({
          name: s.name,
          category: s.category,
        })),
        industrySkills,
        popular: getPopularSkills(),
      });
    }

    // Search skills in database
    const dbSkills = await prisma.skillSuggestion.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
        ...(category && { category }),
      },
      orderBy: { name: 'asc' },
      take: limit,
    });

    // Search skills from resume examples
    const exampleSkills = await prisma.resumeExample.findMany({
      where: {
        skills: { hasSome: [query] },
        isActive: true,
      },
      select: { skills: true },
      take: 20,
    });

    // Extract unique matching skills from examples
    const matchingSkillsFromExamples = new Set<string>();
    exampleSkills.forEach((ex) => {
      ex.skills.forEach((skill) => {
        if (skill.toLowerCase().includes(query)) {
          matchingSkillsFromExamples.add(skill);
        }
      });
    });

    // Combine and deduplicate results
    const allSkills = new Map<string, { name: string; category?: string; source: string }>();

    // Add database skills first (higher priority)
    dbSkills.forEach((skill) => {
      allSkills.set(skill.name.toLowerCase(), {
        name: skill.name,
        category: skill.category,
        source: 'database',
      });
    });

    // Add skills from examples
    matchingSkillsFromExamples.forEach((skill) => {
      const key = skill.toLowerCase();
      if (!allSkills.has(key)) {
        allSkills.set(key, {
          name: skill,
          source: 'examples',
        });
      }
    });

    // Add from static popular skills list
    getPopularSkills()
      .filter((skill) => skill.toLowerCase().includes(query))
      .forEach((skill) => {
        const key = skill.toLowerCase();
        if (!allSkills.has(key)) {
          allSkills.set(key, {
            name: skill,
            source: 'popular',
          });
        }
      });

    const results = Array.from(allSkills.values()).slice(0, limit);

    return NextResponse.json({
      query,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error('Skills API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills', results: [] },
      { status: 500 }
    );
  }
}

// Popular skills list for fallback
function getPopularSkills(): string[] {
  return [
    // Technical
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP',
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'Django', 'Flask',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform',
    'Git', 'GitHub', 'GitLab', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'REST APIs', 'GraphQL', 'Microservices', 'System Design',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Science',
    'Excel', 'Tableau', 'Power BI', 'Google Analytics',

    // Design
    'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe XD', 'Sketch',
    'UI/UX Design', 'Wireframing', 'Prototyping', 'User Research',

    // Marketing
    'SEO', 'SEM', 'Google Ads', 'Facebook Ads', 'Content Marketing',
    'Email Marketing', 'Social Media Marketing', 'HubSpot', 'Mailchimp',

    // Business
    'Project Management', 'Agile', 'Scrum', 'JIRA', 'Confluence', 'Trello',
    'Microsoft Office', 'Google Workspace', 'Slack', 'Zoom',
    'Salesforce', 'CRM', 'SAP', 'QuickBooks', 'NetSuite',

    // Soft Skills
    'Leadership', 'Communication', 'Problem Solving', 'Critical Thinking',
    'Team Collaboration', 'Time Management', 'Adaptability', 'Creativity',
    'Negotiation', 'Public Speaking', 'Conflict Resolution', 'Decision Making',

    // Healthcare
    'Patient Care', 'EMR Systems', 'Epic', 'Cerner', 'HIPAA Compliance',
    'Medical Terminology', 'CPR Certified', 'BLS', 'ACLS',

    // Finance
    'Financial Analysis', 'Financial Modeling', 'Budgeting', 'Forecasting',
    'GAAP', 'Auditing', 'Risk Management', 'Bloomberg Terminal',

    // Languages
    'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Portuguese',
    'Arabic', 'Korean', 'Italian', 'Russian',
  ];
}
