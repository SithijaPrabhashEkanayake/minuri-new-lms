const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    // Attempt a basic query to verify Postgres connection
    await prisma.$queryRaw`SELECT 1`;
    console.log(`Supabase Postgres Connected via Prisma`);
  } catch (error) {
    console.error(`Error connecting to Supabase Postgres: ${error.message}`);
    console.warn(`Continuing without immediate exit. Database might be waking up...`);
  }
};

module.exports = { prisma, connectDB };
