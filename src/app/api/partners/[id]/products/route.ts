import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { productId, stage, discussionNotes } = await request.json();
    
    // Check old stage for logging
    const oldProduct = await prisma.partnerProduct.findUnique({
      where: {
        partnerId_productId: {
          partnerId: resolvedParams.id,
          productId: productId,
        }
      },
      include: { product: true }
    });

    const partnerProduct = await prisma.partnerProduct.upsert({
      where: {
        partnerId_productId: {
          partnerId: resolvedParams.id,
          productId: productId,
        }
      },
      update: {
        stage,
        discussionNotes,
      },
      create: {
        partnerId: resolvedParams.id,
        productId,
        stage: stage || 'Discovery',
        discussionNotes,
      },
      include: { product: true }
    });

    // Log if stage changed
    if (oldProduct && oldProduct.stage !== partnerProduct.stage) {
      await prisma.historyLog.create({
        data: {
          partnerId: resolvedParams.id,
          type: 'System',
          content: `${partnerProduct.product.name} stage changed from ${oldProduct.stage} to ${partnerProduct.stage}`,
        }
      });
    }

    // Update partner last activity
    await prisma.partner.update({ where: { id: resolvedParams.id }, data: { lastActivityAt: new Date() }});

    return NextResponse.json(partnerProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update partner product' }, { status: 500 });
  }
}
