import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    
    const where = partnerId ? { partnerId } : {};
    
    const actions = await prisma.action.findMany({
      where,
      include: { partner: { select: { companyName: true, id: true } } },
      orderBy: { dueDate: 'asc' }
    });
    return NextResponse.json(actions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { partnerId, description, dueDate } = await request.json();
    
    const action = await prisma.action.create({
      data: {
        partnerId,
        description,
        dueDate: new Date(dueDate),
      }
    });
    
    // Update partner last activity
    await prisma.partner.update({ where: { id: partnerId }, data: { lastActivityAt: new Date() }});

    return NextResponse.json(action, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create action' }, { status: 500 });
  }
}
