import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    
    const action = await prisma.action.update({
      where: { id: resolvedParams.id },
      data: { status: body.status }
    });

    if (body.status === 'Completed') {
      await prisma.historyLog.create({
        data: {
          partnerId: action.partnerId,
          type: 'System',
          content: `Task completed: ${action.description}`
        }
      });
    }

    return NextResponse.json(action);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update action' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const action = await prisma.action.delete({
      where: { id: resolvedParams.id }
    });

    await prisma.historyLog.create({
      data: {
        partnerId: action.partnerId,
        type: 'System',
        content: `Task deleted: ${action.description}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete action' }, { status: 500 });
  }
}
