import { PrismaClient, Role, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting QuickFix seed...');

  // --- CATEGORIES ---
  const categories = [
    'Painting',
    'Carpentry',
    'Moving',
    'Masonry',
    'Handyman',
    'Cleaning',
    'Electrician',
    'Plumber',
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} jobs`, icon: '🛠️' },
    });
  }
  console.log('✅ Categories seeded');

  // --- USERS ---
  const customer = await prisma.user.upsert({
    where: { auth0Sub: 'auth0|customer-demo' },
    update: {},
    create: {
      auth0Sub: 'auth0|customer-demo',
      role: Role.customer,
      name: 'John Customer',
      email: 'customer@example.com',
    },
  });

  const pro = await prisma.user.upsert({
    where: { auth0Sub: 'auth0|pro-demo' },
    update: {},
    create: {
      auth0Sub: 'auth0|pro-demo',
      role: Role.pro,
      name: 'Paul Pro',
      email: 'pro@example.com',
    },
  });
  console.log('✅ Demo users seeded');

  // --- SAMPLE JOB ---
  const paintingCategory = await prisma.category.findFirst({
    where: { name: 'Painting' },
  });

  if (paintingCategory) {
    await prisma.job.upsert({
      where: { id: 'demo-job-1' },
      update: {},
      create: {
        id: 'demo-job-1',
        customerId: customer.id,
        categoryId: paintingCategory.id,
        title: 'Paint my living room',
        description:
          'Need help painting a 12x15ft living room. I already have the paint.',
        photos: [],
        addressLine: '123 Main St',
        lat: 37.7749,
        lng: -122.4194,
        scheduledStartAt: new Date(Date.now() + 86400000), // tomorrow
        timeWindowMins: 120,
        budgetFixedCents: 10000,
        status: JobStatus.open,
      },
    });
    console.log('✅ Demo job seeded');
  }

  console.log('🌳 Seed complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
