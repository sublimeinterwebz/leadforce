import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const partnerId = formData.get('partnerId') as string;

    if (!file || !partnerId) {
      return NextResponse.json({ error: 'File and partnerId are required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const document = await prisma.document.create({
      data: {
        partnerId,
        fileName: file.name,
        fileUrl: `/uploads/${filename}`,
        mimeType: file.type,
      }
    });

    await prisma.historyLog.create({
      data: {
        partnerId,
        type: 'System',
        content: `Uploaded document: ${file.name}`
      }
    });
    
    await prisma.partner.update({ where: { id: partnerId }, data: { lastActivityAt: new Date() }});

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
