#!/bin/bash

echo "🔧 Setting up Spordateur database..."
echo ""

echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
echo "✅ Prisma client generated"
echo ""

echo "🚀 Step 2: Pushing schema to database..."
npx prisma db push
if [ $? -ne 0 ]; then
    echo "❌ Failed to push schema"
    exit 1
fi
echo "✅ Schema pushed successfully"
echo ""

echo "🌱 Step 3: Seeding database with test data..."
node prisma/seed.ts
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi
echo ""

echo "🎉 Database setup complete!"
echo ""
echo "You now have:"
echo "  - 10 test users (user1@spordateur.com - user10@spordateur.com)"
echo "  - 5 partner companies with approved status"
echo "  - 10 active offers for sports activities"
echo ""
echo "All test accounts use password: password123"
echo ""
echo "🚀 Start your app with: bun start"
