import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    
    if (!partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
    
    const history = await prisma.historyLog.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { partnerId, content } = await request.json();
    
    const log = await prisma.historyLog.create({
      data: {
        partnerId,
        type: 'UserComment',
        content,
      }
    });
    
    await prisma.partner.update({ where: { id: partnerId }, data: { lastActivityAt: new Date() }});

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
