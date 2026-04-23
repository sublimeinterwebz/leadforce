import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      include: {
        products: {
          include: { product: true }
        },
        actions: true,
      },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(partners);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const partner = await prisma.partner.create({
      data: {
        companyName: body.companyName,
        keyContact: body.keyContact,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        source: body.source,
        industryCategory: body.industryCategory,
        overallStage: body.overallStage || 'Discovery',
      }
    });

    // Log creation
    await prisma.historyLog.create({
      data: {
        partnerId: partner.id,
        type: 'System',
        content: `Lead created for ${partner.companyName}`,
      }
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
