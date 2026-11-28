import { NextRequest, NextResponse } from 'next/server';
import { searchQAKnowledgeFromSupabase } from '@/lib/supabase/interview-questions';

const WHATSAPP_VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN || 'intelligentqa_whatsapp_token_2026';

// GET: Meta Webhook Verification challenge
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST: Receive inbound WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Meta Webhook structure
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message) {
      const from = message.from; // Phone number
      const text = message.text?.body || '';

      console.log(`[WhatsApp Bot] Inbound from ${from}: "${text}"`);

      // Search knowledge base for SDET query or response
      const results = await searchQAKnowledgeFromSupabase(text);
      const answer =
        results.length > 0
          ? `*IntelligentQA Daily SDET Coach*\n\n${results[0].shortAnswer}\n\n💡 _Pro Tip:_ ${results[0].interviewTips}`
          : `*IntelligentQA Daily SDET Coach*\n\nGreat question! Practice this scenario in our interactive coding sandbox at https://intelligentqa.io/sandbox/code\nReply "Explain" for detailed framework architecture breakdown.`;

      // Log zero-cost dispatch
      return NextResponse.json({
        status: 'received',
        to: from,
        simulatedDispatch: answer,
      });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
    return NextResponse.json({ error: 'Failed to process WhatsApp event' }, { status: 500 });
  }
}
