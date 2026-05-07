import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partnerId, fileName, fileUrl, mimeType } = body;

    if (!partnerId || !fileName || !fileUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        partnerId,
        fileName,
        fileUrl,
        mimeType: mimeType || 'application/octet-stream',
      }
    });

    await prisma.historyLog.create({
      data: {
        partnerId,
        type: 'System',
        content: `Uploaded document: ${fileName}`
      }
    });
    
    await prisma.partner.update({ where: { id: partnerId }, data: { lastActivityAt: new Date() }});

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Upload Metadata Error:', error);
    return NextResponse.json({ error: 'Failed to save document metadata' }, { status: 500 });
  }
}
