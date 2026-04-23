import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { status, description, dueDate } = await request.json();
    
    const data: any = {};
    if (status !== undefined) data.status = status;
    if (description !== undefined) data.description = description;
    if (dueDate !== undefined) data.dueDate = new Date(dueDate);

    const action = await prisma.action.update({
      where: { id: resolvedParams.id },
      data,
    });
    
    // Update partner last activity
    await prisma.partner.update({ where: { id: action.partnerId }, data: { lastActivityAt: new Date() }});

    return NextResponse.json(action);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update action' }, { status: 500 });
  }
}
