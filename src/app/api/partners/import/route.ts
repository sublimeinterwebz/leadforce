import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { partners } = await request.json();
    
    if (!Array.isArray(partners) || partners.length === 0) {
      return NextResponse.json({ error: 'No partners provided' }, { status: 400 });
    }

    // Using a transaction to insert all partners and log the import
    const result = await prisma.$transaction(async (tx) => {
      let createdCount = 0;
      for (const p of partners) {
        if (!p.companyName) continue;
        
        await tx.partner.create({
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
