import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

interface AssistantTurn {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_INSTRUCTION = `You are the EzeCampus AI Campus Assistant for college students in Bhilai, Chhattisgarh (serving BIT Durg, IIT Bhilai, Rungta RCET, SSTC Junwani, and CSVTU students).

Your purpose:
1. Help relocating and current students find PGs, hostels, and rental rooms around Bhilai (Smriti Nagar, Nehru Nagar, Junwani, Civic Centre, HUDCO, Sector 6, Sector 10, Kohka, Risali, Supela) using INR pricing.
2. Guide students on AI roommate matching preferences (budget, veg/non-veg/eggetarian, early-bird/night-owl sleep schedules, study habits, cleanliness).
3. Help students navigate the Student Marketplace (used textbooks, calculators, furniture, lab kits), Campus Hub (hackathons, internships, scholarships, workshops, clubs), and Bhilai Local Services (messes, printing, laundry, 24x7 reading libraries, pharmacies, e-rickshaws).
4. Always note clearly when referring to sample/demo listings inside EzeCampus that they are demo data for exploration and should be verified directly before making deposits.

Keep responses concise, structured with clean bullet points, practical for Indian college students, and under 220 words unless the student asks for a detailed comparison.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'ezecampus-api' });
  });

  app.post('/api/assistant', async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        message?: unknown;
        history?: unknown;
        campusContext?: unknown;
      };

      if (typeof body?.message !== 'string') {
        res.status(400).json({ error: 'Message must be a non-empty string.' });
        return;
      }

      const message = body.message.trim();
      if (message.length === 0 || message.length > 2000) {
        res.status(400).json({ error: 'Message must be between 1 and 2000 characters.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(503).json({
          error:
            'Gemini API key is not configured on the server yet. Add GEMINI_API_KEY in Settings > Secrets to activate live AI responses.',
        });
        return;
      }

      const safeHistory: AssistantTurn[] = Array.isArray(body.history)
        ? body.history
            .slice(-10)
            .filter(
              (t): t is AssistantTurn =>
                Boolean(t) &&
                typeof t === 'object' &&
                ((t as AssistantTurn).role === 'user' || (t as AssistantTurn).role === 'assistant') &&
                typeof (t as AssistantTurn).content === 'string' &&
                (t as AssistantTurn).content.length <= 2000
            )
        : [];

      const safeContext =
        typeof body.campusContext === 'string' ? body.campusContext.slice(0, 3500) : '';

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents = [
        ...safeHistory.map((turn) => ({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content }],
        })),
        {
          role: 'user',
          parts: [
            {
              text: safeContext
                ? `Current EzeCampus catalog snapshot:\n${safeContext}\n\nStudent question: ${message}`
                : message,
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'The AI assistant returned an empty response. Please try again.' });
        return;
      }

      res.json({ reply });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unexpected server error';
      console.error('Gemini assistant error:', errMsg);

      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('PERMISSION_DENIED') || errMsg.includes('403')) {
        res.status(502).json({
          error: 'The configured Gemini API key was rejected. Please verify GEMINI_API_KEY in Settings > Secrets.',
        });
        return;
      }
      if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('429')) {
        res.status(429).json({
          error: 'AI assistant rate limit reached. Please wait a moment and try again.',
        });
        return;
      }
      res.status(500).json({
        error: 'Unable to reach the AI assistant right now. Please try again shortly.',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EzeCampus server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
