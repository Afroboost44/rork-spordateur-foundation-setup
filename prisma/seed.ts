const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SPORTS_LIST = [
  'Tennis',
  'Football',
  'Basketball',
  'Yoga',
  'Running',
  'Cyclisme',
  'Natation',
  'Escalade',
  'Boxe',
  'Fitness',
  'Volleyball',
  'Badminton',
];

const LOCATIONS = [
  'Paris',
  'Lyon',
  'Marseille',
  'Toulouse',
  'Bordeaux',
  'Nice',
  'Nantes',
  'Strasbourg',
];

const BIOS = [
  'Passionné de sport et toujours partant pour de nouvelles aventures! 🏃‍♂️',
  'À la recherche de nouveaux partenaires sportifs pour se motiver ensemble 💪',
  'Fan de sport outdoor, j\'aime repousser mes limites',
  'Le sport c\'est la vie! Cherche des personnes motivées',
  'Sportif régulier, je cherche à diversifier mes activités',
  'Addict au sport depuis toujours, toujours prêt pour un nouveau défi',
  'Je crois en l\'importance du sport pour le bien-être mental et physique',
  'Passionné par le fitness et les sports collectifs',
  'Le sport m\'aide à rester équilibré, cherche des compagnons d\'entraînement',
  'Amateur de sports extrêmes et de sensations fortes!',
];

const FIRST_NAMES_M = ['Lucas', 'Thomas', 'Hugo', 'Louis', 'Nathan', 'Arthur', 'Jules', 'Léo', 'Gabriel', 'Maxime'];
const FIRST_NAMES_F = ['Emma', 'Léa', 'Chloé', 'Manon', 'Sarah', 'Laura', 'Clara', 'Camille', 'Alice', 'Julie'];

async function seed() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [];

  for (let i = 0; i < 10; i++) {
    const isMale = i % 2 === 0;
    const firstName = isMale 
      ? FIRST_NAMES_M[Math.floor(Math.random() * FIRST_NAMES_M.length)]
      : FIRST_NAMES_F[Math.floor(Math.random() * FIRST_NAMES_F.length)];
    
    const age = 22 + Math.floor(Math.random() * 18);
    const gender = isMale ? 'Homme' : 'Femme';
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const bio = BIOS[Math.floor(Math.random() * BIOS.length)];
    
    const numSports = 2 + Math.floor(Math.random() * 3);
    const shuffledSports = [...SPORTS_LIST].sort(() => Math.random() - 0.5);
    const sports = shuffledSports.slice(0, numSports);
    
    const images = [
      `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}-${Math.floor(Math.random() * 999999)}?w=800&q=80&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-${1500000000000 + i * 1000000 + 500000}-${Math.floor(Math.random() * 999999)}?w=800&q=80&auto=format&fit=crop`,
      `https://images.unsplash.com/photo-${1500000000000 + i * 1000000 + 900000}-${Math.floor(Math.random() * 999999)}?w=800&q=80&auto=format&fit=crop`,
    ];

    try {
      const user = await prisma.user.create({
        data: {
          email: `user${i + 1}@spordateur.com`,
          passwordHash: hashedPassword,
          name: firstName,
          bio,
          age,
          gender,
          location,
          images,
          sports,
          status: 'ACTIVE',
        },
      });
      
      users.push(user);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    } catch {
      console.log(`⚠️  User user${i + 1}@spordateur.com already exists, skipping...`);
    }
  }

  console.log(`🎉 Seed completed! Created ${users.length} new users.`);
  console.log('📧 All users use password: password123');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
