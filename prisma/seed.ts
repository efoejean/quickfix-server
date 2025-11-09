import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Categories ---
  await prisma.category.createMany({
    data: [
      {
        name: 'Plumbing',
        description: 'Fix leaks, install faucets, and repair pipes.',
      },
      {
        name: 'Electrical',
        description: 'Install lighting, outlets, or fix wiring issues.',
      },
      {
        name: 'Painting',
        description: 'Wall, room, and exterior painting jobs.',
      },
      {
        name: 'Cleaning',
        description: 'House cleaning, deep cleaning, or office cleaning.',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Categories created/ensured');

  // --- Users ---
  const customer = await prisma.user.upsert({
    where: { auth0Sub: 'auth0|customer1' },
    update: {},
    create: {
      auth0Sub: 'auth0|customer1',
      name: 'Jane Customer',
      email: 'customer@example.com',
      role: Role.customer,
    },
  });

  const verifiedPro = await prisma.user.upsert({
    where: { auth0Sub: 'auth0|pro_verified' },
    update: {},
    create: {
      auth0Sub: 'auth0|pro_verified',
      name: 'Victor Verified',
      email: 'pro@example.com',
      role: Role.pro,
    },
  });

  const unverifiedPro = await prisma.user.upsert({
    where: { auth0Sub: 'auth0|pro_unverified' },
    update: {},
    create: {
      auth0Sub: 'auth0|pro_unverified',
      name: 'Una Unverified',
      email: 'newpro@example.com',
      role: Role.pro, // role is pro, but profile is unverified
    },
  });

  console.log('✅ Users created/ensured');

  // --- ProProfiles ---
  await prisma.proProfile.upsert({
    where: { userId: verifiedPro.id },
    update: {},
    create: {
      userId: verifiedPro.id,
      skills: ['plumbing', 'electrical'],
      bio: 'Experienced handyman with 5+ years in home repairs.',
      hourlyRate: 50,
      minJobPrice: 50,
      maxDistanceKm: 25,
      verificationStatus: 'verified',
      portfolioMedia: [],
    },
  });

  await prisma.proProfile.upsert({
    where: { userId: unverifiedPro.id },
    update: {},
    create: {
      userId: unverifiedPro.id,
      skills: ['cleaning'],
      bio: 'New to the platform, specializing in home cleaning.',
      hourlyRate: 25,
      minJobPrice: 40,
      maxDistanceKm: 15,
      verificationStatus: 'unverified',
      portfolioMedia: [],
    },
  });

  console.log('✅ ProProfiles created/ensured');

  // --- Fetch category IDs ---
  const categories = await prisma.category.findMany();
  const plumbing = categories.find((c) => c.name === 'Plumbing');
  const electrical = categories.find((c) => c.name === 'Electrical');
  const painting = categories.find((c) => c.name === 'Painting');

  if (!plumbing || !electrical || !painting) {
    throw new Error('Expected Plumbing, Electrical, and Painting categories to exist');
  }

  // --- Jobs ---
  await prisma.job.createMany({
    data: [
      {
        customerId: customer.id,
        categoryId: plumbing.id,
        title: 'Fix leaking kitchen sink',
        description: 'There’s a small leak under my sink that needs fixing.',
        addressLine: '123 Main Street, New York, NY',
        lat: 40.7128,
        lng: -74.006,
        scheduledStartAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        timeWindowMins: 60,
        budgetFixedCents: 8000, // $80.00
      },
      {
        customerId: customer.id,
        categoryId: electrical.id,
        title: 'Install ceiling fan',
        description: 'Need an electrician to install a new ceiling fan in the bedroom.',
        addressLine: '55 Wall Street, New York, NY',
        lat: 40.706,
        lng: -74.009,
        scheduledStartAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
        timeWindowMins: 90,
        budgetFixedCents: 12000, // $120.00
      },
      {
        customerId: customer.id,
        categoryId: painting.id,
        title: 'Paint my living room',
        description: 'Need help painting my 15x20 ft living room, paint provided.',
        addressLine: '200 Broadway, New York, NY',
        lat: 40.71,
        lng: -74.007,
        scheduledStartAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // in 3 days
        timeWindowMins: 180,
        budgetFixedCents: 20000, // $200.00
      },
    ],
  });

  console.log('✅ Sample jobs created');

  console.log('🌿 Seeding complete!');
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
