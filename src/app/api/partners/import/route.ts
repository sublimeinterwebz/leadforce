import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Normalize stage names from common Excel variants to our standard stages
function normalizeStage(raw: string): string {
  const s = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    'discovery': 'Discovery',
    'scope alignment': 'Scope Alignment',
    'scope': 'Scope Alignment',
    'commitment': 'Commitment',
    'proposal': 'Commitment',
    'contracting': 'Contracting',
    'contract': 'Contracting',
    'delivery': 'Delivery',
    'delivered': 'Delivery',
    'no feedback': 'No Feedback',
    'no response': 'No Feedback',
    'n/a': 'No Feedback',
  };
  return map[s] || raw.trim(); // Fall back to raw value if no match
}

export async function POST(request: Request) {
  try {
    const { partners } = await request.json();
    
    if (!Array.isArray(partners) || partners.length === 0) {
      return NextResponse.json({ error: 'No partners provided' }, { status: 400 });
    }

    // Pre-fetch all products so we can match by name
    const allProducts = await prisma.product.findMany();

    // Process partners one by one (avoids transaction timeout on large imports)
    let createdCount = 0;
    const errors: string[] = [];

    for (const p of partners) {
      if (!p.companyName) continue;

      try {
        const partner = await prisma.partner.create({
          data: {
            companyName: String(p.companyName).substring(0, 255),
            keyContact: p.keyContact ? String(p.keyContact).substring(0, 255) : 'Unknown',
            contactEmail: p.contactEmail ? String(p.contactEmail).substring(0, 255) : null,
            contactPhone: p.contactPhone ? String(p.contactPhone).substring(0, 255) : null,
            source: p.source ? String(p.source).substring(0, 255) : 'Excel Import',
            industryCategory: p.industryCategory ? String(p.industryCategory).substring(0, 255) : 'Other',
            overallStage: normalizeStage(p.overallStage || 'Discovery'),
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
            const product = allProducts.find(
              prod => prod.name.toLowerCase() === svc.serviceName.toLowerCase()
            );
            if (product) {
              await prisma.partnerProduct.create({
                data: {
                  partnerId: partner.id,
                  productId: product.id,
                  stage: normalizeStage(svc.stage || 'Discovery'),
                }
              });
            }
          }

          await prisma.historyLog.create({
            data: {
              partnerId: partner.id,
              type: 'System',
              content: `${p.services.length} service(s) assigned via Excel Import`,
            }
          });
        }

        createdCount++;
      } catch (rowError: any) {
        console.error(`Failed to import "${p.companyName}":`, rowError?.message);
        errors.push(`${p.companyName}: ${rowError?.message?.substring(0, 100)}`);
      }
    }

    if (createdCount === 0 && errors.length > 0) {
      return NextResponse.json({ error: `All rows failed. First error: ${errors[0]}` }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      count: createdCount, 
      errors: errors.length > 0 ? errors : undefined 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: `Import failed: ${error?.message?.substring(0, 200)}` }, { status: 500 });
  }
}
