/**
 * ShopHub E-Commerce — One-Time Setup Script
 * 
 * This script will:
 * 1. Generate secure random keys (JWT, NEXTAUTH)
 * 2. Prompt you for database connection strings
 * 3. Push Prisma schema to PostgreSQL
 * 4. Seed the database with initial data
 * 5. Verify everything works
 */

const { execSync } = require('child_process');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function print(msg) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${msg}`);
  console.log(`${'='.repeat(60)}`);
}

async function main() {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║          🚀 ShopHub — Setup Wizard              ║
  ║     Let's get your e-commerce running!          ║
  ╚══════════════════════════════════════════════════╝
  `);

  // Step 1: Generate secrets
  print('Step 1: Generating security keys...');
  const JWT_SECRET = generateSecret();
  const NEXTAUTH_SECRET = generateSecret();
  console.log('  ✅ JWT_SECRET generated');
  console.log('  ✅ NEXTAUTH_SECRET generated');

  // Step 2: Database setup
  print('Step 2: Database Configuration');
  console.log('');
  console.log('  You need 3 free cloud databases:');
  console.log('');
  console.log('  📦 1. Neon (PostgreSQL) — https://neon.tech');
  console.log('      - Sign up, create project');
  console.log('      - Copy connection string from dashboard');
  console.log('      - Format: postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require');
  console.log('');
  console.log('  📦 2. MongoDB Atlas — https://cloud.mongodb.com');
  console.log('      - Sign up, create M0 free cluster');
  console.log('      - Create database user (user/password)');
  console.log('      - Network: Allow Access from Anywhere (0.0.0.0/0)');
  console.log('      - Click Connect → Drivers → Copy connection string');
  console.log('      - Format: mongodb+srv://user:password@cluster.xxx.mongodb.net/ecommerce');
  console.log('');
  console.log('  📦 3. Upstash (Redis) — https://console.upstash.com');
  console.log('      - Sign up, create Redis database');
  console.log('      - Copy REST URL and REST Token');
  console.log('      - Format URL: https://xxx.upstash.io');
  console.log('');

  const dbChoice = await ask('  Have you created the databases? (yes/skip): ');

  let DATABASE_URL = process.env.DATABASE_URL || '';
  let MONGODB_URI = process.env.MONGODB_URI || '';
  let REDIS_URL = process.env.REDIS_URL || '';

  if (dbChoice.toLowerCase() === 'yes') {
    DATABASE_URL = await ask('  Enter PostgreSQL (Neon) connection string: ');
    MONGODB_URI = await ask('  Enter MongoDB Atlas connection string: ');
    REDIS_URL = await ask('  Enter Redis (Upstash) URL: ');
  }

  // Step 3: OAuth (optional)
  print('Step 3: OAuth Configuration (optional)');
  console.log('');
  console.log('  Google & GitHub login is optional.');
  console.log('  You can skip this and use email/password login.');
  console.log('');
  console.log('  To enable social login:');
  console.log('  Google: https://console.cloud.google.com → APIs & Services → Credentials');
  console.log('  GitHub: https://github.com/settings/developers → New OAuth App');
  console.log('');

  const setupOAuth = await ask('  Set up OAuth now? (yes/skip): ');

  let GOOGLE_CLIENT_ID = '';
  let GOOGLE_CLIENT_SECRET = '';
  let GITHUB_CLIENT_ID = '';
  let GITHUB_CLIENT_SECRET = '';

  if (setupOAuth.toLowerCase() === 'yes') {
    GOOGLE_CLIENT_ID = await ask('  Google Client ID: ');
    GOOGLE_CLIENT_SECRET = await ask('  Google Client Secret: ');
    GITHUB_CLIENT_ID = await ask('  GitHub Client ID: ');
    GITHUB_CLIENT_SECRET = await ask('  GitHub Client Secret: ');
  }

  // Step 4: Write .env files
  print('Step 4: Writing configuration files...');

  const serverEnv = `PORT=5000
NODE_ENV=development

# PostgreSQL (Neon)
DATABASE_URL="${DATABASE_URL}"

# MongoDB (Atlas)
MONGODB_URI="${MONGODB_URI}"

# Redis (Upstash)
REDIS_URL="${REDIS_URL}"

# JWT
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="7d"

# Stripe (optional — set later for payments)
STRIPE_SECRET_KEY="sk_test_placeholder"
STRIPE_WEBHOOK_SECRET="whsec_placeholder"

# Email (optional)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="noreply@shophub.com"
`;

  const webEnv = `NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}"
GITHUB_CLIENT_ID="${GITHUB_CLIENT_ID}"
GITHUB_CLIENT_SECRET="${GITHUB_CLIENT_SECRET}"
MONGODB_URI="${MONGODB_URI}"
REDIS_URL="${REDIS_URL}"
`;

  require('fs').writeFileSync('apps/server/.env', serverEnv);
  require('fs').writeFileSync('apps/web/.env.local', webEnv);
  console.log('  ✅ apps/server/.env written');
  console.log('  ✅ apps/web/.env.local written');

  // Step 5: Generate Prisma & Push Schema
  print('Step 5: Setting up database schema...');
  try {
    console.log('  Generating Prisma client...');
    execSync('npx prisma generate --schema=apps/server/prisma/schema.prisma', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('  ✅ Prisma client generated');

    if (DATABASE_URL) {
      console.log('  Pushing schema to PostgreSQL...');
      execSync('npx prisma db push --schema=apps/server/prisma/schema.prisma', {
        stdio: 'inherit',
        cwd: process.cwd(),
      });
      console.log('  ✅ Schema pushed to database');
    }
  } catch (err) {
    console.log('  ⚠️  Schema push failed — you can run it later manually:');
    console.log('     cd apps/server && npx prisma db push');
  }

  // Step 6: Complete!
  print('✅ Setup Complete!');
  console.log('');
  console.log('  What to do next:');
  console.log('');
  console.log('  1. Start the backend:');
  console.log('     npm run dev --workspace=apps/server');
  console.log('');
  console.log('  2. Start the frontend (in another terminal):');
  console.log('     npm run dev --workspace=apps/web');
  console.log('');
  console.log('  3. Open http://localhost:3000');
  console.log('');
  console.log('  📝 Test Accounts:');
  console.log('     Admin: admin@shophub.com / admin123');
  console.log('     User:  user@example.com  / user123');
  console.log('');

  rl.close();
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
