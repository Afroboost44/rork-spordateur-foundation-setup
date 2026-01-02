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

const PARTNERS = [
  { name: 'FitZone Geneva', description: 'Centre de fitness premium avec équipements dernière génération', address: 'Rue du Rhône 45, Genève', sport: 'Fitness' },
  { name: 'Tennis Club Lausanne', description: 'Club de tennis avec courts couverts et extérieurs', address: 'Avenue de Rhodanie 12, Lausanne', sport: 'Tennis' },
  { name: 'Yoga Studio Montreux', description: 'Studio de yoga et méditation face au lac', address: 'Grand Rue 23, Montreux', sport: 'Yoga' },
  { name: 'Escalade Vertical', description: 'Salle d\'escalade indoor avec murs de 15m', address: 'Chemin des Sports 8, Fribourg', sport: 'Escalade' },
  { name: 'SwissBoxing Academy', description: 'École de boxe et sports de combat', address: 'Route de Berne 56, Neuchâtel', sport: 'Boxe' },
];

const OFFER_TEMPLATES = [
  { title: 'Session découverte fitness', description: 'Découvrez notre centre avec un coach personnel pendant 1h', price: 35 },
  { title: 'Cours de tennis en duo', description: 'Cours de tennis pour 2 personnes avec un instructeur pro', price: 80 },
  { title: 'Yoga sunrise session', description: 'Séance de yoga matinale avec vue sur le lac', price: 25 },
  { title: 'Initiation escalade', description: 'Première escalade avec équipement et supervision inclus', price: 45 },
  { title: 'Boxe sparring session', description: 'Entraînement de boxe en binôme avec coach', price: 50 },
];

const OFFER_IMAGES = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80&auto=format&fit=crop',
];

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

  console.log('\n🏢 Creating partners...');
  const partners = [];

  for (let i = 0; i < PARTNERS.length; i++) {
    const partnerData = PARTNERS[i];
    
    try {
      const partner = await prisma.partner.create({
        data: {
          email: `partner${i + 1}@spordateur.com`,
          passwordHash: hashedPassword,
          companyName: partnerData.name,
          description: partnerData.description,
          address: partnerData.address,
          status: 'APPROVED',
        },
      });
      
      partners.push({ ...partner, sport: partnerData.sport });
      console.log(`✅ Created partner: ${partner.companyName}`);
    } catch {
      console.log(`⚠️  Partner partner${i + 1}@spordateur.com already exists, skipping...`);
    }
  }

  console.log('\n🎯 Creating offers...');
  let offersCreated = 0;

  for (let i = 0; i < partners.length; i++) {
    const partner = partners[i];
    const offerTemplate = OFFER_TEMPLATES[i];
    
    const daysAhead = [3, 7, 10, 14, 21];
    
    for (let d = 0; d < 2; d++) {
      const offerDate = new Date();
      offerDate.setDate(offerDate.getDate() + daysAhead[d]);
      offerDate.setHours(10 + (d * 2), 0, 0, 0);

      try {
        await prisma.offer.create({
          data: {
            partnerId: partner.id,
            title: offerTemplate.title,
            price: offerTemplate.price,
            description: offerTemplate.description,
            datetime: offerDate,
            location: partner.address,
            imageUrl: OFFER_IMAGES[i],
            sport: partner.sport,
            isActive: true,
          },
        });
        
        offersCreated++;
        console.log(`✅ Created offer: ${offerTemplate.title} for ${partner.companyName}`);
      } catch {
        console.log(`⚠️  Offer already exists, skipping...`);
      }
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   🏢 Partners: ${partners.length}`);
  console.log(`   🎯 Offers: ${offersCreated}`);
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
