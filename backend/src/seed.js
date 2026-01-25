const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  });

  // Create club user
  const clubPassword = await bcrypt.hash('club123', 12);
  const clubUser = await prisma.user.upsert({
    where: { email: 'club@example.com' },
    update: {},
    create: {
      email: 'club@example.com',
      password: clubPassword,
      firstName: 'Club',
      lastName: 'Manager',
      role: 'CLUB'
    }
  });

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      password: studentPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'STUDENT'
    }
  });

  // Create club
  const club = await prisma.club.upsert({
    where: { name: 'Tech Society' },
    update: {},
    create: {
      name: 'Tech Society',
      description: 'A club for technology enthusiasts and developers',
      website: 'https://techsociety.example.com',
      instagram: '@techsociety',
      facebook: 'TechSocietyOfficial',
      twitter: '@techsociety',
      ownerId: clubUser.id
    }
  });

  // Create sample events
  const event1 = await prisma.event.upsert({
    where: { id: 'event-1' },
    update: {},
    create: {
      id: 'event-1',
      title: 'Web Development Workshop',
      description: 'Learn modern web development with React and Node.js',
      venue: 'Computer Lab A',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxSeats: 50,
      price: 0,
      status: 'APPROVED',
      creatorId: clubUser.id,
      clubId: club.id
    }
  });

  const event2 = await prisma.event.upsert({
    where: { id: 'event-2' },
    update: {},
    create: {
      id: 'event-2',
      title: 'AI and Machine Learning Seminar',
      description: 'Explore the latest trends in AI and ML',
      venue: 'Auditorium',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      maxSeats: 100,
      price: 10,
      status: 'PENDING',
      creatorId: clubUser.id,
      clubId: club.id
    }
  });

  console.log('Database seeded successfully!');
  console.log('Created users:');
  console.log('- Admin: admin@example.com / admin123');
  console.log('- Club: club@example.com / club123');
  console.log('- Student: student@example.com / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
