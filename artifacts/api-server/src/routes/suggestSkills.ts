import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/candidates/suggest-complementary-skills", async (req, res): Promise<void> => {
  try {
    const rawSkills = req.body?.skills;
    const skills: string[] = Array.isArray(rawSkills)
      ? rawSkills.filter((s): s is string => typeof s === "string" && s.trim().length > 0).slice(0, 50)
      : [];

    if (skills.length === 0) {
      res.json({ skills: [] });
      return;
    }

    const currentTitle =
      typeof req.body?.currentTitle === "string" ? req.body.currentTitle.trim().slice(0, 200) : "";

    const systemPrompt =
      "You are a careers expert. Given a candidate's current skills, suggest 12 COMPLEMENTARY skills that would strengthen their profile. " +
      "Complementary means: closely related, commonly paired in the same roles, or natural next steps that build on what they already have. " +
      "Do not repeat any skill the candidate already has (case-insensitive). " +
      "Keep each suggestion short (1–4 words), industry-standard, and concrete. " +
      'Respond ONLY with valid JSON of the form {"skills": ["Skill 1", "Skill 2", ...]}.';

    const userContent =
      `Current skills: ${skills.join(", ")}` +
      (currentTitle ? `\nCurrent role: ${currentTitle}` : "") +
      "\n\nSuggest 12 complementary skills as JSON.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      max_completion_tokens: 512,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      req.log.error({ raw: raw.slice(0, 500) }, "suggest-complementary-skills: invalid JSON from model");
      res.status(502).json({ error: "AI returned invalid response. Please try again." });
      return;
    }

    const lowerExisting = new Set(skills.map(s => s.toLowerCase().trim()));
    const suggested: string[] = Array.isArray(parsed?.skills)
      ? parsed.skills
          .filter((s: unknown): s is string => typeof s === "string" && s.trim().length > 0)
          .map((s: string) => s.trim())
          .filter((s: string) => !lowerExisting.has(s.toLowerCase()))
      : [];

    const seen = new Set<string>();
    const unique = suggested.filter(s => {
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    res.json({ skills: unique.slice(0, 12) });
  } catch (err) {
    req.log.error({ err }, "suggest-complementary-skills failed");
    res.status(500).json({ error: "Couldn't generate complementary skills." });
  }
});

export default router;
