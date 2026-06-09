import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are TeamFlow AI, a helpful project management assistant. You help users manage tasks, track deadlines, and stay productive. Be concise, friendly, and actionable. Respond in the user's language (French or English).

Key context about the current workspace:
- 6 projects: Website Redesign (65%), Mobile App V2 (40%), API Integration (80%), Marketing Campaign (25%), Data Analytics Dashboard (55%), Security Audit (100%)
- 12 tasks across all projects, with priorities ranging from urgent to low
- 8 team members: Alex (Admin), Sarah, Marcus, Emily, David, Lisa, James, Nina
- Upcoming meetings: Sprint Planning, Design Review, Mobile App Sync
- Current sprint focus: Website Redesign and API Integration

When asked about tasks, projects, or deadlines, provide specific, actionable information. If you don't have exact data, give helpful general advice. Keep responses under 3 paragraphs unless the user asks for detail.`;

const SUGGESTIONS_PROMPT = `You are TeamFlow AI, a smart productivity assistant for a project management app. Generate 5 actionable productivity suggestions for the user based on their workspace context.

Current workspace context:
- 6 projects: Website Redesign (65%), Mobile App V2 (40%), API Integration (80%), Marketing Campaign (25%), Data Analytics Dashboard (55%), Security Audit (100%)
- 12 tasks: 2 urgent, 4 high priority, 4 medium, 2 low
- 3 tasks are in progress, 2 in review, 3 todo, 2 done
- 8 team members, 5 online
- Upcoming meetings: Sprint Planning (tomorrow), Design Review (tomorrow), Mobile App Sync (day after)
- 2 tasks are overdue

Return a JSON array of 5 suggestion objects. Each object must have:
- id: a unique string (e.g., "sug-1")
- icon: an emoji icon for the suggestion
- title: a short title (max 40 chars)
- description: a brief description (max 80 chars)
- action: the action button label (max 20 chars)
- actionType: one of "create_task", "view_project", "schedule_meeting", "review_task", "check_deadline"

Example format:
[{"id":"sug-1","icon":"⏰","title":"Review overdue tasks","description":"2 tasks are past their due date and need attention","action":"Review now","actionType":"review_task"}]

IMPORTANT: Return ONLY the JSON array, no markdown, no explanation.`;

const FALLBACK_SUGGESTIONS = [
  { id: 'sug-1', icon: '⏰', title: 'Review overdue tasks', description: '2 tasks are past their due date and need attention', action: 'Review now', actionType: 'review_task' },
  { id: 'sug-2', icon: '🚀', title: 'Focus on API Integration', description: 'Project is 80% complete — push to finish this sprint', action: 'View project', actionType: 'view_project' },
  { id: 'sug-3', icon: '📅', title: 'Prepare for Sprint Planning', description: 'Meeting tomorrow at 10 AM — review backlog first', action: 'Schedule', actionType: 'schedule_meeting' },
  { id: 'sug-4', icon: '✅', title: 'Close completed reviews', description: '2 tasks are in review and ready for final approval', action: 'Review tasks', actionType: 'review_task' },
  { id: 'sug-5', icon: '📋', title: 'Break down Marketing Campaign', description: 'Only 25% progress — consider splitting into smaller tasks', action: 'Create task', actionType: 'create_task' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, mode } = body as { message?: string; context?: string; mode?: string };

    // ─── Suggestions Mode ───────────────────────────────────────────────────
    if (mode === 'suggestions') {
      try {
        const ZAI = (await import('z-ai-web-dev-sdk')).default;
        const zai = await ZAI.create();
        const response = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: SUGGESTIONS_PROMPT },
          ],
          thinking: { type: 'disabled' },
        });

        const aiContent = response.choices?.[0]?.message?.content;
        if (aiContent) {
          // Try to parse the AI response as JSON
          try {
            // Remove markdown code blocks if present
            const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const suggestions = JSON.parse(cleanContent);
            if (Array.isArray(suggestions) && suggestions.length > 0) {
              return NextResponse.json({ suggestions: suggestions.slice(0, 5) });
            }
          } catch {
            // AI didn't return valid JSON, use fallback
          }
        }
      } catch {
        // AI call failed, use fallback
      }
      // Fallback suggestions
      return NextResponse.json({ suggestions: FALLBACK_SUGGESTIONS });
    }

    // ─── Chat Mode ──────────────────────────────────────────────────────────
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (context) {
      messages.push({ role: 'user', content: `[Context]: ${context}` });
      messages.push({ role: 'assistant', content: 'Got it, I have the context. How can I help?' });
    }

    messages.push({ role: 'user', content: message.trim() });

    // Call LLM API via z-ai-web-dev-sdk
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    });

    const aiContent = response.choices?.[0]?.message?.content;

    if (!aiContent) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: aiContent });
  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get AI response',
        fallback: "I'm having trouble connecting right now. Please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
