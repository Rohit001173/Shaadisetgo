import { PrismaClient } from '@prisma/client';
import { dbConfig } from './config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Log database mode
if (typeof window === 'undefined') {
  console.log(`📦 Database: ${dbConfig.isSupabase ? 'Supabase PostgreSQL' : 'Local SQLite'}`);
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export { dbConfig };
