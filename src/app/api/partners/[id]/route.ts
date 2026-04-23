import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const partner = await prisma.partner.findUnique({
      where: { id: resolvedParams.id },
      include: {
        products: { include: { product: true } },
        actions: true,
        history: { orderBy: { createdAt: 'desc' } },
        documents: true,
      }
    });
    if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    return NextResponse.json(partner);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    
    // Get old partner to check status change
    const oldPartner = await prisma.partner.findUnique({ where: { id: resolvedParams.id } });
    
    const partner = await prisma.partner.update({
      where: { id: resolvedParams.id },
      data: { ...body, lastActivityAt: new Date() }
    });

    // Log if stage changed
    if (oldPartner && oldPartner.overallStage !== partner.overallStage) {
      await prisma.historyLog.create({
        data: {
          partnerId: partner.id,
          type: 'System',
          content: `Overall stage changed from ${oldPartner.overallStage} to ${partner.overallStage}`,
        }
      });
    }

    return NextResponse.json(partner);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.partner.delete({ where: { id: resolvedParams.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }
}
