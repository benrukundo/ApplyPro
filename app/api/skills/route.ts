// app/api/skills/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim().toLowerCase();
    const category = searchParams.get('category');
    const industry = searchParams.get('industry');
    const limit = parseInt(searchParams.get('limit') || '10');

    // If no query, return category-specific suggestions
    if (!query || query.length < 1) {
      // Get skills from database suggestions filtered by category
      const skillSuggestions = await prisma.skillSuggestion.findMany({
        where: category ? { category } : undefined,
        orderBy: { name: 'asc' },
        take: 20,
      });

      // Get category-specific popular skills
      const popularSkills = getPopularSkillsByCategory(category);

      // Get industry-specific skills if industry is provided
      let industrySkills: string[] = [];
      if (industry && category === 'technical') {
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

        const skillCount: Record<string, number> = {};
        examples.forEach((ex) => {
          ex.skills.forEach((skill) => {
            skillCount[skill] = (skillCount[skill] || 0) + 1;
          });
        });

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
        popular: popularSkills,
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

    // Search in category-specific popular skills
    const categorySkills = getPopularSkillsByCategory(category);
    const matchingCategorySkills = categorySkills.filter((skill) =>
      skill.toLowerCase().includes(query)
    );

    // Combine and deduplicate results
    const allSkills = new Map<string, { name: string; category?: string; source: string }>();

    // Add database skills first
    dbSkills.forEach((skill) => {
      allSkills.set(skill.name.toLowerCase(), {
        name: skill.name,
        category: skill.category,
        source: 'database',
      });
    });

    // Add matching category skills
    matchingCategorySkills.forEach((skill) => {
      const key = skill.toLowerCase();
      if (!allSkills.has(key)) {
        allSkills.set(key, {
          name: skill,
          category: category || undefined,
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

// Category-specific popular skills
function getPopularSkillsByCategory(category?: string | null): string[] {
  switch (category) {
    case 'technical':
      return [
        // Programming Languages
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
        // Frameworks & Libraries
        'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Ruby on Rails',
        // Databases
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Oracle', 'SQLite',
        // Cloud & DevOps
        'AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitHub Actions', 'CI/CD',
        // Tools
        'Git', 'GitHub', 'GitLab', 'JIRA', 'Confluence', 'VS Code', 'Linux', 'Bash',
        // Data & ML
        'Machine Learning', 'Data Analysis', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Tableau', 'Power BI',
        // Design Tools
        'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe XD', 'Sketch',
        // Business Tools
        'Microsoft Office', 'Excel (Advanced)', 'Google Workspace', 'Salesforce', 'SAP', 'QuickBooks', 'HubSpot',
        // APIs & Architecture
        'REST APIs', 'GraphQL', 'Microservices', 'System Design', 'API Design',
      ];

    case 'soft':
      return [
        // Leadership & Management
        'Leadership', 'Team Leadership', 'People Management', 'Mentoring', 'Coaching', 'Delegation',
        // Communication
        'Communication', 'Written Communication', 'Verbal Communication', 'Public Speaking', 'Presentation Skills', 'Active Listening',
        // Problem Solving
        'Problem Solving', 'Critical Thinking', 'Analytical Skills', 'Decision Making', 'Strategic Thinking', 'Research',
        // Interpersonal
        'Team Collaboration', 'Teamwork', 'Interpersonal Skills', 'Relationship Building', 'Networking', 'Cross-functional Collaboration',
        // Organization
        'Time Management', 'Organization', 'Prioritization', 'Multitasking', 'Attention to Detail', 'Planning',
        // Adaptability
        'Adaptability', 'Flexibility', 'Learning Agility', 'Growth Mindset', 'Resilience', 'Stress Management',
        // Creativity
        'Creativity', 'Innovation', 'Design Thinking', 'Brainstorming',
        // Professional
        'Negotiation', 'Conflict Resolution', 'Emotional Intelligence', 'Customer Service', 'Client Relations',
        'Project Management', 'Process Improvement', 'Quality Assurance',
      ];

    case 'languages':
      return [
        // With proficiency levels
        'English (Native)', 'English (Fluent)', 'English (Professional)',
        'Spanish (Native)', 'Spanish (Fluent)', 'Spanish (Conversational)', 'Spanish (Basic)',
        'French (Native)', 'French (Fluent)', 'French (Conversational)', 'French (Basic)',
        'German (Native)', 'German (Fluent)', 'German (Conversational)', 'German (Basic)',
        'Mandarin Chinese (Native)', 'Mandarin Chinese (Fluent)', 'Mandarin Chinese (Conversational)',
        'Cantonese (Native)', 'Cantonese (Fluent)',
        'Japanese (Native)', 'Japanese (Fluent)', 'Japanese (Conversational)',
        'Korean (Native)', 'Korean (Fluent)', 'Korean (Conversational)',
        'Portuguese (Native)', 'Portuguese (Fluent)', 'Portuguese (Conversational)',
        'Italian (Native)', 'Italian (Fluent)', 'Italian (Conversational)',
        'Arabic (Native)', 'Arabic (Fluent)', 'Arabic (Conversational)',
        'Russian (Native)', 'Russian (Fluent)', 'Russian (Conversational)',
        'Hindi (Native)', 'Hindi (Fluent)',
        'Dutch (Native)', 'Dutch (Fluent)',
        'Swedish (Native)', 'Swedish (Fluent)',
        'Polish (Native)', 'Polish (Fluent)',
        'Turkish (Native)', 'Turkish (Fluent)',
        'Vietnamese (Native)', 'Vietnamese (Fluent)',
        'Thai (Native)', 'Thai (Fluent)',
        'Hebrew (Native)', 'Hebrew (Fluent)',
        'Greek (Native)', 'Greek (Fluent)',
        'Sign Language (ASL)', 'Sign Language (BSL)',
      ];

    case 'certifications':
      return [
        // Cloud & IT
        'AWS Certified Solutions Architect', 'AWS Certified Developer', 'AWS Certified Cloud Practitioner',
        'Azure Administrator', 'Azure Developer', 'Azure Solutions Architect',
        'Google Cloud Certified', 'Google Cloud Professional',
        'CompTIA A+', 'CompTIA Network+', 'CompTIA Security+',
        'CCNA (Cisco)', 'CCNP (Cisco)',
        'CISSP', 'CEH (Certified Ethical Hacker)',
        
        // Project Management
        'PMP (Project Management Professional)', 'CAPM',
        'Scrum Master (CSM)', 'Professional Scrum Master (PSM)',
        'Agile Certified Practitioner (PMI-ACP)',
        'PRINCE2', 'PRINCE2 Practitioner',
        'Six Sigma Green Belt', 'Six Sigma Black Belt', 'Lean Six Sigma',
        
        // Finance & Accounting
        'CPA (Certified Public Accountant)', 'CMA (Certified Management Accountant)',
        'CFA (Chartered Financial Analyst)', 'CFP (Certified Financial Planner)',
        'Series 7', 'Series 63', 'Series 65', 'Series 66',
        'EA (Enrolled Agent)',
        
        // HR & Business
        'PHR (Professional in Human Resources)', 'SPHR (Senior Professional in HR)',
        'SHRM-CP', 'SHRM-SCP',
        'CBAP (Certified Business Analysis Professional)',
        
        // Marketing & Sales
        'Google Analytics Certified', 'Google Ads Certified',
        'HubSpot Inbound Certified', 'HubSpot Content Marketing',
        'Facebook Blueprint Certified',
        'Salesforce Administrator', 'Salesforce Developer',
        
        // Healthcare
        'RN (Registered Nurse)', 'LPN (Licensed Practical Nurse)',
        'BLS (Basic Life Support)', 'ACLS (Advanced Cardiac Life Support)',
        'PALS (Pediatric Advanced Life Support)',
        'CNA (Certified Nursing Assistant)', 'CMA (Certified Medical Assistant)',
        'CPR Certified', 'First Aid Certified',
        'HIPAA Certified',
        
        // Real Estate & Legal
        'Real Estate License', 'Broker License',
        'Paralegal Certificate', 'Notary Public',
        
        // Teaching & Training
        'Teaching Certificate', 'TESOL/TEFL',
        'Certified Trainer',
        
        // Industry Specific
        'OSHA Safety Certified', 'OSHA 10', 'OSHA 30',
        'Food Handler Certificate', 'ServSafe',
        'CDL (Commercial Driver License)',
        'Forklift Certified',
      ];

    default:
      // Return a mix of all categories
      return [
        'JavaScript', 'Python', 'Excel', 'SQL',
        'Leadership', 'Communication', 'Problem Solving',
        'English (Fluent)', 'Spanish (Conversational)',
        'PMP', 'AWS Certified',
      ];
  }
}
