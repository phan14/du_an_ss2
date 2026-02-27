import { request } from 'http';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request) {
  console.log('Cron job triggered');
  return NextResponse.json({ message: 'Cron job executed successfully' }), { status: 200 }
};