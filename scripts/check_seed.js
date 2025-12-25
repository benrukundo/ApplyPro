const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔎 Verifying seed data counts...');
  const jobCategories = await prisma.jobCategory.count();
  const resumeExamples = await prisma.resumeExample.count();
  const skillSuggestions = await prisma.skillSuggestion.count();

  console.log(`jobCategories: ${jobCategories}`);
  console.log(`resumeExamples: ${resumeExamples}`);
  console.log(`skillSuggestions: ${skillSuggestions}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Verification failed:', e);
  process.exit(1);
});
