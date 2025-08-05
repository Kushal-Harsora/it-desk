import { prisma } from '@/server/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await prisma.$connect();
    return  NextResponse.json({ message: 'db connected successfully' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ 
        message: '❌ Failed to connect to the database:',
        error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}