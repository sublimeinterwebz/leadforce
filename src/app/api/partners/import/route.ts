import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { partners } = await request.json();
    
    if (!Array.isArray(partners) || partners.length === 0) {
      return NextResponse.json({ error: 'No partners provided' }, { status: 400 });
    }

    // Pre-fetch all products so we can match by name
    const allProducts = await prisma.product.findMany();

    const result = await prisma.$transaction(async (tx) => {
      let createdCount = 0;
      for (const p of partners) {
        if (!p.companyName) continue;
        
        const partner = await tx.partner.create({
          data: {
            companyName: String(p.companyName).substring(0, 255),
            keyContact: p.keyContact ? String(p.keyContact).substring(0, 255) : 'Unknown',
            contactEmail: p.contactEmail ? String(p.contactEmail).substring(0, 255) : null,
            contactPhone: p.contactPhone ? String(p.contactPhone).substring(0, 255) : null,
            source: p.source ? String(p.source).substring(0, 255) : 'Excel Import',
            industryCategory: p.industryCategory ? String(p.industryCategory).substring(0, 255) : 'Other',
            overallStage: p.overallStage ? String(p.overallStage) : 'Discovery',
            history: {
              create: {
                type: 'System',
                content: 'Partner imported via Bulk Excel Upload',
              }
            }
          }
        });

        // Create service assignments if present
        if (Array.isArray(p.services) && p.services.length > 0) {
          for (const svc of p.services) {
            // Find the matching product (case-insensitive)
            const product = allProducts.find(
              prod => prod.name.toLowerCase() === svc.serviceName.toLowerCase()
            );
            if (product) {
              await tx.partnerProduct.create({
                data: {
                  partnerId: partner.id,
                  productId: product.id,
                  stage: svc.stage || 'Discovery',
                }
              });
            }
          }

          await tx.historyLog.create({
            data: {
              partnerId: partner.id,
              type: 'System',
              content: `${p.services.length} service(s) assigned via Excel Import`,
            }
          });
        }

        createdCount++;
      }
      return createdCount;
    });

    return NextResponse.json({ success: true, count: result }, { status: 201 });
  } catch (error) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: 'Failed to import partners' }, { status: 500 });
  }
}

