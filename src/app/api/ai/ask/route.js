import { NextResponse } from 'next/server';
import { protect } from '@/lib/authMiddleware';
import { prisma } from '@/lib/db';
import Groq from 'groq-sdk';

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function POST(request) {
  try {
    const userAuth = await protect(request);

    const body = await request.json();
    const { query } = body;
    
    if (!query) {
      return NextResponse.json({ message: 'Query is required' }, { status: 400 });
    }

    if (query.length > 2000) {
      return NextResponse.json({ message: 'Query is too long. Maximum 2000 characters allowed.' }, { status: 400 });
    }

    if (!groq) {
      return NextResponse.json({
        text: "Hi! I am the AI Tutor. To activate my full capabilities, please add a valid GROQ_API_KEY to your backend `.env.local` file!",
        cite: "System Config"
      });
    }

    // Fetch knowledge base context
    const sources = await prisma.aiSource.findMany({
      where: { status: 'Indexed', content: { not: '' } },
      take: 5 // Limit to top 5 sources to save tokens
    });

    let contextString = "";
    if (sources.length > 0) {
      contextString = "\n\nUSE THE FOLLOWING COURSE CONTEXT TO ANSWER THE QUESTION:\n";
      sources.forEach((s, idx) => {
        if (s.content) {
          contextString += `\n--- SOURCE ${idx + 1}: ${s.name} ---\n${s.content}\n`;
        }
      });
    }

    const systemPrompt = `You are a strict, helpful, and concise ICT Tutor for Grade 10-11 students. 
Only answer questions related to Information and Communication Technology (ICT), computer science, programming, or the school syllabus. 
If a student asks something unrelated, politely steer them back to ICT. Keep your answers concise, educational, and easy to understand for a high schooler. 
Do not use markdown headers, just plain text and bullet points if necessary. 
Always end your response by citing the source you used. If you used the provided course context, cite the specific SOURCE NAME. If you didn't need the context, cite 'General ICT Knowledge'.${contextString}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: query
        }
      ],
      model: 'llama-3.1-8b-instant',
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    // Simple heuristic to extract citation if the model followed instructions
    let cite = "Groq AI Tutor (Llama 3)";
    if (sources.length > 0 && responseText.toLowerCase().includes('source:')) {
       cite = "Course Materials (RAG)";
    }

    return NextResponse.json({
      text: responseText,
      cite: cite
    });

  } catch (error) {
    console.error('Groq API Error:', error);
    if (error.message && (error.message.startsWith('Not authorized') || error.message.startsWith('Forbidden'))) {
      return NextResponse.json({ message: error.message }, { status: error.message.startsWith('Forbidden') ? 403 : 401 });
    }
    if (error.status === 401 || error.status === 403) {
      return NextResponse.json({ 
        text: "I'm sorry, but my Groq API Key is receiving an authentication error. Please check your Groq console or try a different key!",
        cite: "System Error"
      });
    }

    return NextResponse.json({ message: 'Error communicating with AI service.' }, { status: 500 });
  }
}
