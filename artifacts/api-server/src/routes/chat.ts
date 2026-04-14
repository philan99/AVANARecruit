import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

function getSystemPrompt(role: string | null): string {
  const base = `You are AVANA, a helpful recruitment assistant for the AVANA Recruitment platform — an AI-powered job matching platform that connects companies with candidates based on skills, experience, education, and location. Be friendly, concise, and professional. Use British English.`;

  if (role === "company") {
    return `${base}

You are assisting a company user. They can:
- Post and manage job listings
- Browse and search candidate profiles
- View AI-generated match scores between their jobs and candidates
- Bookmark candidates they're interested in
- Contact candidates through the platform
- View their company dashboard with recruitment analytics

Help them with questions about posting jobs, finding the right candidates, understanding match scores, using filters, managing their recruitment pipeline, and any other platform features. If they ask about something outside recruitment or the platform, politely redirect them.`;
  }

  if (role === "candidate") {
    return `${base}

You are assisting a candidate user. They can:
- Create and manage their profile (skills, experience, education, CV upload)
- Browse open job positions with filters (location, job type, industry, etc.)
- View AI-generated match scores for jobs that suit their profile
- Apply to jobs through the platform
- Save favourite jobs for later
- See if they've been shortlisted by companies
- Request employment verifications

Help them with questions about optimising their profile, finding suitable jobs, understanding match scores, the application process, and any other platform features. If they ask about something outside job searching or the platform, politely redirect them.`;
  }

  return `${base}

You are speaking with a visitor who is not logged in. They may be interested in learning about the platform. Help them understand:
- What AVANA Recruitment does (AI-powered job matching)
- How the platform works for companies and candidates
- The benefits of using the platform
- How to sign up or sign in
- Pricing information (if asked, direct them to the Pricing page)
- General recruitment questions

Encourage them to create an account to get started. If they ask about specific account features, explain them briefly and suggest signing up.`;
}

router.post("/chat", async (req, res): Promise<void> => {
  try {
    const { messages, role } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    const systemPrompt = getSystemPrompt(role || null);

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 2048,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process chat message" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "An error occurred" })}\n\n`);
      res.end();
    }
  }
});

export default router;
