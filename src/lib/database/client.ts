import { PrismaClient } from '@prisma/client';

// Simple Prisma client - Turso is SQLite-compatible
export const prisma = new PrismaClient();
