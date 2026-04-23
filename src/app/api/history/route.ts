import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    
    if (!partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 });
    
    const history = await prisma.historyLog.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { partnerId, content } = await request.json();
    
    const log = await prisma.historyLog.create({
      data: {
        partnerId,
        type: 'UserComment',
        content,
      }
    });
    
    await prisma.partner.update({ where: { id: partnerId }, data: { lastActivityAt: new Date() }});

    // Smart AI Task Extraction
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are a CRM assistant. The user just typed the following note: "${content}"
Today's date is ${new Date().toISOString()}.
Extract any actionable tasks from the note. Return ONLY a valid JSON array. Do not use markdown blocks.
Each object must have 'description' (string) and 'dueDate' (ISO 8601 date string).
If there are no clear tasks, return [].`;

        const aiRes = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        // Strip potential markdown blocks just in case
        const rawText = aiRes.text || '[]';
        const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        let parsed = JSON.parse(cleanText);
        // Sometimes the AI returns { tasks: [...] } instead of [...]
        let tasks = Array.isArray(parsed) ? parsed : (parsed.tasks || []);

        if (Array.isArray(tasks) && tasks.length > 0) {
          for (const task of tasks) {
            if (!task.description || !task.dueDate) continue;
            await prisma.action.create({
              data: { partnerId, description: task.description, dueDate: new Date(task.dueDate) }
            });
            await prisma.historyLog.create({
              data: { partnerId, type: 'System', content: `AI auto-created task: ${task.description}` }
            });
          }
        } else {
          console.error("AI parsed successfully but found no valid tasks array. Raw output:", cleanText);
        }
      } catch (aiError) {
        console.error('AI error:', aiError);
      }
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
