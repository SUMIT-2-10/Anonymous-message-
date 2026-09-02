/**
 * ============================================
 * FILE: src/app/api/suggest-messages/route.ts
 * Layer: backend/api
 * Purpose: Documents the role of this module in the project and how it connects with adjacent modules.
 * Why It Exists: Keeps concerns separated (UI, API, auth, validation, email, or data-access) for maintainability.
 * Integration: Imported by related pages/routes/components to participate in the app request and rendering lifecycle.
 * Route: /api/suggest-messages
 * Request Flow: receives request -> validates/parses input -> executes business logic -> returns JSON response.
 * Error Handling: returns explicit status codes for authentication, validation, and server failures.
 * ============================================
 */

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const result = streamText({
      model: openai('gpt-3.5-turbo'),
      prompt,
      maxOutputTokens: 400,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
