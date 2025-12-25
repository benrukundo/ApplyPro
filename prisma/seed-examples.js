const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============================================
// JOB CATEGORIES DATA
// ============================================
const jobCategories = [
  {
    name: "Information Technology",
    slug: "information-technology",
    description: "Technology professionals who design, develop, and maintain software, systems, and digital infrastructure.",
    icon: "Monitor",
    sortOrder: 1,
    metaTitle: "IT Resume Examples & Templates | ApplyPro",
    metaDescription: "Browse professional IT resume examples for software engineers, developers, data scientists, and more. Get hired faster with AI-optimized templates.",
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    description: "Medical professionals dedicated to patient care, treatment, and health services.",
    icon: "Heart",
    sortOrder: 2,
    metaTitle: "Healthcare Resume Examples & Templates | ApplyPro",
    metaDescription: "Professional healthcare resume examples for nurses, doctors, medical assistants, and healthcare administrators.",
  },
  {
    name: "Business & Management",
    slug: "business-management",
    description: "Leaders and managers who drive business strategy, operations, and team performance.",
    icon: "Briefcase",
    sortOrder: 3,
    metaTitle: "Business & Management Resume Examples | ApplyPro",
    metaDescription: "Executive and management resume examples for business leaders, project managers, and operations professionals.",
  },
  {
    name: "Education",
    slug: "education",
    description: "Educators and academic professionals who shape minds and advance learning.",
    icon: "GraduationCap",
    sortOrder: 4,
    metaTitle: "Education Resume Examples & Templates | ApplyPro",
    metaDescription: "Teacher and educator resume examples for all levels from K-12 to higher education.",
  },
  {
    name: "Sales & Marketing",
    slug: "sales-marketing",
    description: "Professionals who drive revenue growth, brand awareness, and customer acquisition.",
    icon: "TrendingUp",
    sortOrder: 5,
    metaTitle: "Sales & Marketing Resume Examples | ApplyPro",
    metaDescription: "Sales and marketing resume examples for account executives, marketing managers, and digital marketers.",
  },
  {
    name: "Finance & Accounting",
    slug: "finance-accounting",
    description: "Financial professionals who manage money, analyze data, and ensure fiscal responsibility.",
    icon: "DollarSign",
    sortOrder: 6,
    metaTitle: "Finance & Accounting Resume Examples | ApplyPro",
    metaDescription: "Professional finance resume examples for accountants, financial analysts, and CFOs.",
  },
  {
    name: "Engineering",
    slug: "engineering",
    description: "Engineers who design, build, and optimize systems, structures, and products.",
    icon: "Cog",
    sortOrder: 7,
    metaTitle: "Engineering Resume Examples & Templates | ApplyPro",
    metaDescription: "Engineering resume examples for mechanical, civil, electrical, and other engineering disciplines.",
  },
  {
    name: "Creative & Design",
    slug: "creative-design",
    description: "Creative professionals who bring ideas to life through visual design and artistic expression.",
    icon: "Palette",
    sortOrder: 8,
    metaTitle: "Creative & Design Resume Examples | ApplyPro",
    metaDescription: "Creative resume examples for graphic designers, UX designers, and art directors.",
  },
  {
    name: "Customer Service",
    slug: "customer-service",
    description: "Service professionals who ensure customer satisfaction and build lasting relationships.",
    icon: "Headphones",
    sortOrder: 9,
    metaTitle: "Customer Service Resume Examples | ApplyPro",
    metaDescription: "Customer service resume examples for support specialists, account managers, and service representatives.",
  },
  {
    name: "Human Resources",
    slug: "human-resources",
    description: "HR professionals who manage talent, culture, and employee experience.",
    icon: "Users",
    sortOrder: 10,
    metaTitle: "Human Resources Resume Examples | ApplyPro",
    metaDescription: "HR resume examples for recruiters, HR managers, and talent acquisition specialists.",
  },
  {
    name: "Legal",
    slug: "legal",
    description: "Legal professionals who navigate law, compliance, and justice.",
    icon: "Scale",
    sortOrder: 11,
    metaTitle: "Legal Resume Examples & Templates | ApplyPro",
    metaDescription: "Legal resume examples for lawyers, paralegals, and legal assistants.",
  },
  {
    name: "Hospitality & Food Service",
    slug: "hospitality",
    description: "Hospitality professionals who create memorable experiences in food, travel, and entertainment.",
    icon: "UtensilsCrossed",
    sortOrder: 12,
    metaTitle: "Hospitality Resume Examples | ApplyPro",
    metaDescription: "Hospitality resume examples for chefs, hotel managers, and restaurant professionals.",
  },
  {
    name: "Construction & Trades",
    slug: "construction-trades",
    description: "Skilled tradespeople who build and maintain our physical infrastructure.",
    icon: "HardHat",
    sortOrder: 13,
    metaTitle: "Construction Resume Examples | ApplyPro",
    metaDescription: "Construction resume examples for contractors, electricians, and skilled tradespeople.",
  },
  {
    name: "Transportation & Logistics",
    slug: "transportation-logistics",
    description: "Logistics professionals who keep goods and people moving efficiently.",
    icon: "Truck",
    sortOrder: 14,
    metaTitle: "Transportation Resume Examples | ApplyPro",
    metaDescription: "Transportation resume examples for truck drivers, logistics coordinators, and warehouse managers.",
  },
  {
    name: "Retail",
    slug: "retail",
    description: "Retail professionals who drive sales and create excellent shopping experiences.",
    icon: "ShoppingBag",
    sortOrder: 15,
    metaTitle: "Retail Resume Examples & Templates | ApplyPro",
    metaDescription: "Retail resume examples for sales associates, store managers, and merchandisers.",
  },
];

// ============================================
// RESUME EXAMPLES DATA (Starting with IT)
// ============================================
const itExamples = [
  {
    jobTitle: "Software Engineer",
    slug: "software-engineer",
    experienceLevel: "mid",
    sampleSummary: "Results-driven Software Engineer with 5+ years of experience designing and implementing scalable web applications. Proficient in full-stack development using JavaScript, Python, and cloud technologies. Proven track record of reducing system latency by 40% and leading cross-functional teams to deliver projects ahead of schedule. Passionate about clean code, test-driven development, and mentoring junior developers.",
    sampleBulletPoints: [
      "Architected and deployed microservices handling 2M+ daily API requests with 99.9% uptime",
      "Led migration from monolithic architecture to microservices, reducing deployment time by 60%",
      "Implemented CI/CD pipelines using GitHub Actions and Docker, cutting release cycles from weeks to hours",
      "Mentored 4 junior developers through code reviews and pair programming sessions",
      "Optimized database queries resulting in 45% improvement in application response time",
      "Collaborated with product team to define technical requirements for 3 major feature releases"
    ],
    sampleSkills: {
      technical: ["JavaScript", "TypeScript", "Python", "React", "Node.js", "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes"],
      soft: ["Problem Solving", "Team Leadership", "Communication", "Agile/Scrum", "Code Review"],
      tools: ["Git", "VS Code", "Jira", "Jenkins", "Terraform"]
    },
    suggestedSkills: ["JavaScript", "Python", "React", "Node.js", "SQL", "Git", "AWS", "Docker", "REST APIs", "Agile"],
    suggestedKeywords: ["software development", "full-stack", "microservices", "CI/CD", "agile", "cloud computing", "scalable systems", "code review", "technical leadership"],
    summaryTemplate: "Software Engineer with [X] years of experience in [technologies]. Skilled in [key skills]. Proven ability to [key achievement].",
    salaryRangeMin: 90000,
    salaryRangeMax: 160000,
    jobOutlook: "Growing 25% through 2032 (Much faster than average)",
    demandLevel: "high",
    writingTips: [
      "Quantify your achievements with specific metrics (users served, performance improvements, cost savings)",
      "Highlight both technical skills and soft skills like communication and teamwork",
      "Include specific technologies and frameworks you've worked with",
      "Mention any open-source contributions or side projects",
      "Show progression in responsibility and technical complexity"
    ],
    commonMistakes: [
      "Listing every technology you've touched instead of focusing on expertise",
      "Writing generic descriptions without measurable impact",
      "Forgetting to mention collaboration and communication skills",
      "Not tailoring the resume to the specific job description"
    ],
    metaTitle: "Software Engineer Resume Example & Writing Guide | ApplyPro",
    metaDescription: "Create a winning Software Engineer resume with our AI-powered builder. See real examples, get expert tips, and land more interviews.",
    isFeatured: true,
  },
  {
    jobTitle: "Software Engineer",
    slug: "software-engineer-entry",
    experienceLevel: "entry",
    sampleSummary: "Motivated Computer Science graduate with strong foundation in software development and passion for building user-centric applications. Experienced in JavaScript, Python, and React through academic projects and internship. Quick learner eager to contribute to a collaborative development team and grow technical expertise.",
    sampleBulletPoints: [
      "Developed a full-stack e-commerce application using React and Node.js as senior capstone project",
      "Completed 3-month internship building internal tools that improved team productivity by 20%",
      "Contributed to open-source project with 500+ GitHub stars, fixing 5 bugs and adding 2 features",
      "Built REST APIs handling authentication and data persistence for mobile app serving 1,000+ users",
      "Collaborated with 4-person team using Agile methodology to deliver projects on schedule"
    ],
    sampleSkills: {
      technical: ["JavaScript", "Python", "React", "Node.js", "SQL", "HTML/CSS", "Git"],
      soft: ["Problem Solving", "Teamwork", "Communication", "Quick Learner", "Attention to Detail"],
      tools: ["VS Code", "GitHub", "Postman", "Figma"]
    },
    suggestedSkills: ["JavaScript", "Python", "React", "HTML/CSS", "Git", "SQL", "REST APIs", "Problem Solving"],
    suggestedKeywords: ["computer science", "software development", "coding", "programming", "entry-level", "graduate", "internship"],
    salaryRangeMin: 65000,
    salaryRangeMax: 95000,
    jobOutlook: "Growing 25% through 2032",
    demandLevel: "high",
    writingTips: [
      "Highlight relevant coursework and academic projects",
      "Include any internship or co-op experience prominently",
      "Showcase personal projects and GitHub contributions",
      "Emphasize your eagerness to learn and grow",
      "Include relevant certifications or online courses completed"
    ],
    commonMistakes: [
      "Underselling academic projects - treat them like real work experience",
      "Not including a GitHub or portfolio link",
      "Focusing only on coursework without showing practical application",
      "Writing a generic objective instead of a targeted summary"
    ],
    metaTitle: "Entry-Level Software Engineer Resume Example | ApplyPro",
    metaDescription: "Land your first software engineering job with our entry-level resume guide. Perfect for new graduates and career changers.",
  },
  {
    jobTitle: "Web Developer",
    slug: "web-developer",
    experienceLevel: "mid",
    sampleSummary: "Creative Web Developer with 4+ years of experience building responsive, user-friendly websites and web applications. Expert in modern frontend technologies including React, Vue.js, and CSS frameworks. Strong background in UI/UX principles with a portfolio of 20+ live projects. Committed to writing clean, maintainable code and staying current with web development trends.",
    sampleBulletPoints: [
      "Developed and maintained 15+ client websites generating combined monthly traffic of 500K+ visitors",
      "Reduced page load times by 50% through code optimization and image compression techniques",
      "Implemented responsive designs achieving 98% mobile usability score on Google Lighthouse",
      "Built custom WordPress themes and plugins for e-commerce clients, increasing conversions by 25%",
      "Collaborated with UX designers to translate Figma mockups into pixel-perfect implementations",
      "Integrated third-party APIs including payment gateways, social media, and analytics platforms"
    ],
    sampleSkills: {
      technical: ["JavaScript", "React", "Vue.js", "HTML5", "CSS3", "SASS", "Tailwind CSS", "PHP", "WordPress", "REST APIs"],
      soft: ["Creativity", "Attention to Detail", "Communication", "Time Management", "Problem Solving"],
      tools: ["VS Code", "Figma", "Git", "Chrome DevTools", "Webpack"]
    },
    suggestedSkills: ["JavaScript", "React", "HTML5", "CSS3", "Responsive Design", "Git", "WordPress", "UI/UX", "REST APIs"],
    suggestedKeywords: ["web development", "frontend", "responsive design", "HTML", "CSS", "JavaScript", "React", "user experience"],
    salaryRangeMin: 70000,
    salaryRangeMax: 120000,
    jobOutlook: "Growing 16% through 2032",
    demandLevel: "high",
    writingTips: [
      "Include a link to your portfolio website",
      "Mention specific frameworks and tools you're proficient in",
      "Highlight responsive design and mobile-first development experience",
      "Include performance optimization achievements",
      "Show client-facing communication skills"
    ],
    commonMistakes: [
      "Not having a portfolio to showcase your work",
      "Listing outdated technologies prominently",
      "Ignoring the business impact of your technical work",
      "Not mentioning accessibility or performance optimization"
    ],
    metaTitle: "Web Developer Resume Example & Template | ApplyPro",
    metaDescription: "Build a standout Web Developer resume. See professional examples and get AI-powered suggestions for your skills and experience.",
    isFeatured: true,
  },
  {
    jobTitle: "Data Scientist",
    slug: "data-scientist",
    experienceLevel: "mid",
    sampleSummary: "Data Scientist with 4+ years of experience transforming complex data into actionable business insights. Expert in Python, machine learning, and statistical analysis with a track record of building predictive models that drive revenue growth. Strong communicator who bridges the gap between technical teams and business stakeholders.",
    sampleBulletPoints: [
      "Built customer churn prediction model achieving 92% accuracy, saving $2M annually in retention costs",
      "Developed recommendation engine that increased e-commerce conversion rates by 35%",
      "Created automated reporting dashboards reducing manual analysis time by 20 hours per week",
      "Led A/B testing program analyzing 50+ experiments, driving data-informed product decisions",
      "Implemented NLP pipeline for sentiment analysis processing 100K+ customer reviews monthly",
      "Mentored 2 junior data analysts in Python, SQL, and machine learning fundamentals"
    ],
    sampleSkills: {
      technical: ["Python", "SQL", "Machine Learning", "TensorFlow", "scikit-learn", "Pandas", "NumPy", "Tableau", "Apache Spark"],
      soft: ["Data Storytelling", "Business Acumen", "Problem Solving", "Communication", "Critical Thinking"],
      tools: ["Jupyter", "Git", "AWS SageMaker", "Databricks", "Power BI"]
    },
    suggestedSkills: ["Python", "SQL", "Machine Learning", "Statistics", "Data Visualization", "TensorFlow", "Pandas", "Business Intelligence"],
    suggestedKeywords: ["data science", "machine learning", "predictive modeling", "statistical analysis", "Python", "SQL", "data visualization", "A/B testing"],
    salaryRangeMin: 100000,
    salaryRangeMax: 170000,
    jobOutlook: "Growing 36% through 2032 (Much faster than average)",
    demandLevel: "high",
    writingTips: [
      "Quantify business impact of your models and analyses",
      "Include specific ML algorithms and techniques you've used",
      "Highlight your ability to communicate findings to non-technical stakeholders",
      "Mention any published research or Kaggle competition rankings",
      "Show end-to-end project ownership from data collection to deployment"
    ],
    commonMistakes: [
      "Focusing only on technical skills without showing business impact",
      "Not explaining your models in accessible terms",
      "Listing tools without demonstrating what you built with them",
      "Ignoring the importance of data cleaning and preparation"
    ],
    metaTitle: "Data Scientist Resume Example & Guide | ApplyPro",
    metaDescription: "Create a Data Scientist resume that gets interviews. Expert examples, ML project descriptions, and ATS-optimized templates.",
    isFeatured: true,
  },
  {
    jobTitle: "DevOps Engineer",
    slug: "devops-engineer",
    experienceLevel: "mid",
    sampleSummary: "DevOps Engineer with 5+ years of experience building and maintaining cloud infrastructure and CI/CD pipelines. Expert in AWS, Kubernetes, and infrastructure as code with a focus on automation, reliability, and security. Reduced deployment failures by 80% and infrastructure costs by 40% through optimization and best practices.",
    sampleBulletPoints: [
      "Designed and implemented Kubernetes clusters hosting 50+ microservices with 99.99% uptime",
      "Built CI/CD pipelines reducing deployment time from 2 hours to 15 minutes",
      "Automated infrastructure provisioning with Terraform, managing 200+ AWS resources",
      "Implemented comprehensive monitoring and alerting using Prometheus and Grafana",
      "Led migration from on-premise to AWS, reducing infrastructure costs by $500K annually",
      "Established security best practices and achieved SOC 2 compliance"
    ],
    sampleSkills: {
      technical: ["AWS", "Kubernetes", "Docker", "Terraform", "Jenkins", "Python", "Bash", "Linux", "Prometheus", "Grafana"],
      soft: ["Problem Solving", "Automation Mindset", "Collaboration", "Documentation", "Incident Response"],
      tools: ["Git", "Ansible", "ArgoCD", "DataDog", "PagerDuty"]
    },
    suggestedSkills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "Python", "Monitoring", "Security"],
    suggestedKeywords: ["DevOps", "cloud infrastructure", "CI/CD", "automation", "Kubernetes", "AWS", "infrastructure as code", "reliability"],
    salaryRangeMin: 110000,
    salaryRangeMax: 175000,
    jobOutlook: "Growing 23% through 2032",
    demandLevel: "high",
    writingTips: [
      "Quantify improvements in deployment speed, uptime, and cost savings",
      "List specific cloud certifications (AWS, GCP, Azure)",
      "Highlight automation achievements and tools you've built",
      "Include incident response and on-call experience",
      "Show progression from manual processes to automated solutions"
    ],
    commonMistakes: [
      "Listing tools without explaining what you achieved with them",
      "Not mentioning security and compliance experience",
      "Ignoring soft skills like collaboration with development teams",
      "Forgetting to include monitoring and observability experience"
    ],
    metaTitle: "DevOps Engineer Resume Example | ApplyPro",
    metaDescription: "Build a DevOps Engineer resume that stands out. Cloud infrastructure, CI/CD, and automation examples with expert tips.",
  },
  {
    jobTitle: "Product Manager",
    slug: "product-manager",
    experienceLevel: "mid",
    sampleSummary: "Strategic Product Manager with 5+ years of experience driving product vision and roadmap for B2B SaaS applications. Proven track record of launching products that generated $10M+ in ARR. Expert at translating customer needs into technical requirements and aligning cross-functional teams around shared goals.",
    sampleBulletPoints: [
      "Led product strategy for flagship SaaS platform serving 500+ enterprise customers",
      "Launched 3 major product features that increased customer retention by 25%",
      "Managed product roadmap and backlog for team of 12 engineers and designers",
      "Conducted 100+ customer interviews to identify pain points and validate solutions",
      "Increased NPS score from 32 to 58 through systematic feedback analysis and iteration",
      "Collaborated with sales team to develop product positioning that shortened sales cycles by 20%"
    ],
    sampleSkills: {
      technical: ["Product Roadmapping", "A/B Testing", "SQL", "Data Analysis", "Jira", "Figma", "Analytics Tools"],
      soft: ["Strategic Thinking", "Stakeholder Management", "Communication", "Customer Empathy", "Decision Making"],
      tools: ["Jira", "Amplitude", "Mixpanel", "Figma", "Notion", "Confluence"]
    },
    suggestedSkills: ["Product Strategy", "Roadmapping", "User Research", "Data Analysis", "Agile", "Stakeholder Management", "A/B Testing"],
    suggestedKeywords: ["product management", "roadmap", "agile", "user research", "product strategy", "stakeholder management", "B2B", "SaaS"],
    salaryRangeMin: 120000,
    salaryRangeMax: 180000,
    jobOutlook: "Growing 10% through 2032",
    demandLevel: "high",
    writingTips: [
      "Focus on business outcomes and metrics you influenced",
      "Show your process for discovery, prioritization, and delivery",
      "Include specific examples of stakeholder alignment",
      "Highlight both quantitative and qualitative research methods",
      "Demonstrate technical understanding without being overly technical"
    ],
    commonMistakes: [
      "Listing features shipped without business impact",
      "Not showing customer-centricity in your approach",
      "Focusing too much on tools instead of outcomes",
      "Ignoring cross-functional collaboration examples"
    ],
    metaTitle: "Product Manager Resume Example | ApplyPro",
    metaDescription: "Create a Product Manager resume that lands interviews. See real examples and get AI-powered tips for your PM career.",
    isFeatured: true,
  },
];

// ============================================
// HEALTHCARE EXAMPLES
// ============================================
const healthcareExamples = [
  {
    jobTitle: "Registered Nurse",
    slug: "registered-nurse",
    experienceLevel: "mid",
    sampleSummary: "Compassionate Registered Nurse with 5+ years of experience in fast-paced hospital environments. Specialized in critical care with expertise in patient assessment, medication administration, and emergency response. Known for excellent patient communication and ability to remain calm under pressure. BLS, ACLS, and PALS certified.",
    sampleBulletPoints: [
      "Provided direct patient care for 6-8 patients per shift in 30-bed medical-surgical unit",
      "Reduced medication errors by 40% through implementation of double-check verification system",
      "Trained and mentored 10+ new graduate nurses during their orientation period",
      "Achieved 95% patient satisfaction scores through compassionate, attentive care",
      "Collaborated with interdisciplinary team to develop individualized care plans",
      "Responded to 50+ code blue situations, demonstrating expertise in emergency protocols"
    ],
    sampleSkills: {
      technical: ["Patient Assessment", "IV Therapy", "Wound Care", "Medication Administration", "Electronic Health Records (EHR)", "Vital Signs Monitoring"],
      soft: ["Compassion", "Communication", "Critical Thinking", "Stress Management", "Teamwork", "Patient Advocacy"],
      tools: ["Epic", "Cerner", "Meditech", "IV Pumps", "Cardiac Monitors"]
    },
    suggestedSkills: ["Patient Care", "Medication Administration", "EHR Systems", "IV Therapy", "Patient Assessment", "BLS/ACLS", "Communication"],
    suggestedKeywords: ["registered nurse", "patient care", "clinical", "healthcare", "nursing", "medication administration", "patient assessment"],
    salaryRangeMin: 65000,
    salaryRangeMax: 95000,
    jobOutlook: "Growing 6% through 2032",
    demandLevel: "high",
    writingTips: [
      "Include all relevant certifications (BLS, ACLS, specialty certifications)",
      "Quantify patient load and outcomes where possible",
      "Highlight specific clinical skills and specializations",
      "Include experience with EHR systems",
      "Show progression in responsibility and specialization"
    ],
    commonMistakes: [
      "Not listing certifications and their expiration dates",
      "Being too vague about clinical responsibilities",
      "Forgetting to mention specific EHR systems used",
      "Not highlighting patient outcomes and satisfaction"
    ],
    metaTitle: "Registered Nurse Resume Example | ApplyPro",
    metaDescription: "Create a professional nursing resume with our RN resume example. Get hired faster with ATS-optimized templates.",
    isFeatured: true,
  },
  {
    jobTitle: "Medical Assistant",
    slug: "medical-assistant",
    experienceLevel: "entry",
    sampleSummary: "Dedicated Medical Assistant with clinical and administrative expertise gained through CMA certification program and 200+ hours of clinical externship. Proficient in patient intake, vital signs, phlebotomy, and EHR documentation. Passionate about providing excellent patient care and supporting efficient clinic operations.",
    sampleBulletPoints: [
      "Completed 200-hour clinical externship in busy family practice seeing 40+ patients daily",
      "Performed patient intake procedures including vital signs, medical history, and chief complaints",
      "Assisted physicians with minor procedures and administered injections as directed",
      "Maintained accurate patient records in electronic health record system",
      "Scheduled appointments and managed patient flow to optimize clinic efficiency",
      "Performed phlebotomy and prepared specimens for laboratory analysis"
    ],
    sampleSkills: {
      technical: ["Vital Signs", "Phlebotomy", "EKG", "Injections", "EHR Documentation", "Medical Terminology"],
      soft: ["Patient Care", "Attention to Detail", "Communication", "Organization", "Multitasking"],
      tools: ["Epic", "Athenahealth", "Medical Equipment", "Autoclave"]
    },
    suggestedSkills: ["Vital Signs", "Phlebotomy", "Patient Intake", "EHR Systems", "Medical Terminology", "CPR Certified"],
    suggestedKeywords: ["medical assistant", "clinical", "patient care", "phlebotomy", "vital signs", "EHR", "healthcare"],
    salaryRangeMin: 35000,
    salaryRangeMax: 50000,
    jobOutlook: "Growing 14% through 2032 (Much faster than average)",
    demandLevel: "high",
    writingTips: [
      "Highlight your certification (CMA, RMA, CCMA)",
      "Include clinical externship experience prominently",
      "List both clinical and administrative skills",
      "Mention specific EHR systems you've used",
      "Include any specialty experience (pediatrics, dermatology, etc.)"
    ],
    commonMistakes: [
      "Not including certification information",
      "Underselling externship experience",
      "Forgetting to list bilingual abilities if applicable",
      "Not showing both front and back office skills"
    ],
    metaTitle: "Medical Assistant Resume Example | ApplyPro",
    metaDescription: "Land your Medical Assistant job with our professional resume example. Perfect for CMAs and recent graduates.",
  },
];

// ============================================
// SKILLS SUGGESTIONS DATA
// ============================================
const skillsSuggestions = [
  // Technical - Software Development
  { name: "JavaScript", category: "technical", relatedJobs: ["software-engineer", "web-developer", "full-stack-developer", "frontend-developer"], popularity: 100 },
  { name: "Python", category: "technical", relatedJobs: ["software-engineer", "data-scientist", "machine-learning-engineer", "backend-developer"], popularity: 98 },
  { name: "React", category: "technical", relatedJobs: ["software-engineer", "web-developer", "frontend-developer", "full-stack-developer"], popularity: 95 },
  { name: "Node.js", category: "technical", relatedJobs: ["software-engineer", "web-developer", "backend-developer", "full-stack-developer"], popularity: 90 },
  { name: "SQL", category: "technical", relatedJobs: ["software-engineer", "data-scientist", "data-analyst", "database-administrator"], popularity: 92 },
  { name: "TypeScript", category: "technical", relatedJobs: ["software-engineer", "web-developer", "frontend-developer"], popularity: 85 },
  { name: "AWS", category: "technical", relatedJobs: ["software-engineer", "devops-engineer", "cloud-architect", "solutions-architect"], popularity: 88 },
  { name: "Docker", category: "technical", relatedJobs: ["software-engineer", "devops-engineer", "backend-developer"], popularity: 82 },
  { name: "Kubernetes", category: "technical", relatedJobs: ["devops-engineer", "cloud-architect", "site-reliability-engineer"], popularity: 75 },
  { name: "Git", category: "technical", relatedJobs: ["software-engineer", "web-developer", "devops-engineer"], popularity: 95 },

  // Technical - Data
  { name: "Machine Learning", category: "technical", relatedJobs: ["data-scientist", "machine-learning-engineer", "ai-engineer"], popularity: 80 },
  { name: "TensorFlow", category: "technical", relatedJobs: ["data-scientist", "machine-learning-engineer", "ai-engineer"], popularity: 70 },
  { name: "Pandas", category: "technical", relatedJobs: ["data-scientist", "data-analyst"], popularity: 75 },
  { name: "Tableau", category: "technical", relatedJobs: ["data-analyst", "business-analyst", "data-scientist"], popularity: 65 },

  // Healthcare
  { name: "Patient Care", category: "technical", relatedJobs: ["registered-nurse", "medical-assistant", "cna", "lpn"], popularity: 90 },
  { name: "Medication Administration", category: "technical", relatedJobs: ["registered-nurse", "lpn", "pharmacist"], popularity: 85 },
  { name: "Phlebotomy", category: "technical", relatedJobs: ["medical-assistant", "phlebotomist", "registered-nurse"], popularity: 70 },
  { name: "EHR Systems", category: "technical", relatedJobs: ["registered-nurse", "medical-assistant", "healthcare-administrator"], popularity: 80 },
  { name: "BLS Certified", category: "certification", relatedJobs: ["registered-nurse", "medical-assistant", "emt", "paramedic"], popularity: 90 },
  { name: "ACLS Certified", category: "certification", relatedJobs: ["registered-nurse", "icu-nurse", "emergency-nurse"], popularity: 75 },

  // Soft Skills
  { name: "Communication", category: "soft", relatedJobs: ["*"], popularity: 100 },
  { name: "Problem Solving", category: "soft", relatedJobs: ["*"], popularity: 98 },
  { name: "Teamwork", category: "soft", relatedJobs: ["*"], popularity: 95 },
  { name: "Leadership", category: "soft", relatedJobs: ["manager", "team-lead", "director", "executive"], popularity: 85 },
  { name: "Time Management", category: "soft", relatedJobs: ["*"], popularity: 90 },
  { name: "Critical Thinking", category: "soft", relatedJobs: ["*"], popularity: 88 },
  { name: "Attention to Detail", category: "soft", relatedJobs: ["*"], popularity: 85 },
  { name: "Adaptability", category: "soft", relatedJobs: ["*"], popularity: 80 },

  // Tools
  { name: "Microsoft Office", category: "tool", relatedJobs: ["*"], popularity: 90 },
  { name: "Google Workspace", category: "tool", relatedJobs: ["*"], popularity: 85 },
  { name: "Jira", category: "tool", relatedJobs: ["software-engineer", "product-manager", "project-manager"], popularity: 75 },
  { name: "Figma", category: "tool", relatedJobs: ["ux-designer", "ui-designer", "product-designer", "web-developer"], popularity: 70 },
  { name: "Salesforce", category: "tool", relatedJobs: ["sales-representative", "account-executive", "sales-manager"], popularity: 65 },
];

// ============================================
// MAIN SEED FUNCTION
// ============================================
async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (optional - remove in production)
  console.log('Clearing existing data...');
  await prisma.exampleInteraction.deleteMany();
  await prisma.resumeExample.deleteMany();
  await prisma.jobCategory.deleteMany();
  await prisma.skillSuggestion.deleteMany();

  // Seed Job Categories
  console.log('Seeding job categories...');
  const categoryMap = {};

  for (const category of jobCategories) {
    const created = await prisma.jobCategory.create({
      data: category,
    });
    categoryMap[category.slug] = created.id;
    console.log(`  ✓ Created category: ${category.name}`);
  }

  // Seed IT Examples
  console.log('Seeding IT resume examples...');
  for (const example of itExamples) {
    await prisma.resumeExample.create({
      data: {
        ...example,
        categoryId: categoryMap['information-technology'],
      },
    });
    console.log(`  ✓ Created example: ${example.jobTitle} (${example.experienceLevel})`);
  }

  // Seed Healthcare Examples
  console.log('Seeding Healthcare resume examples...');
  for (const example of healthcareExamples) {
    await prisma.resumeExample.create({
      data: {
        ...example,
        categoryId: categoryMap['healthcare'],
      },
    });
    console.log(`  ✓ Created example: ${example.jobTitle} (${example.experienceLevel})`);
  }

  // Seed Skills Suggestions
  console.log('Seeding skills suggestions...');
  for (const skill of skillsSuggestions) {
    await prisma.skillSuggestion.create({
      data: skill,
    });
  }
  console.log(`  ✓ Created ${skillsSuggestions.length} skill suggestions`);

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
