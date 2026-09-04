import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

// In-memory store for Hackathon MVP
// Maps roomId -> { sharedCode, tasks: { [playerId]: { bugId, objective, roomId, sectionCode } } }
const gameStateStore = new Map<string, any>();

async function readRandomProblem() {
  const possiblePaths = [
    path.resolve(__dirname, '../../BTech_100_Basic_Coding_Problem_Statements.md'),
    path.resolve(__dirname, '../src/data/BTech_100_Basic_Coding_Problem_Statements.md'),
    path.resolve(__dirname, '../BTech_100_Basic_Coding_Problem_Statements.md'),
    path.resolve(process.cwd(), 'src/data/BTech_100_Basic_Coding_Problem_Statements.md'),
    path.resolve(process.cwd(), '../BTech_100_Basic_Coding_Problem_Statements.md')
  ];

  let content = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        content = fs.readFileSync(p, 'utf-8');
        break;
      } catch (e) {}
    }
  const problems: Array<{ title: string; description: string }> = [];
  if (content) {
    const problemRegex = /###\s+\d+\.\s+(.*?)\n\n([\s\S]*?)(?=\n###|\n---|---|\n#|$)/g;
    let match;
    while ((match = problemRegex.exec(content)) !== null) {
      if (match[1] && match[2]) {
        problems.push({ title: match[1].trim(), description: match[2].trim() });
      }
    }
  }

  if (problems.length === 0) {
    return { title: 'Add Two Numbers', description: 'Write a program to accept two integers and print their sum.' };
  }

  const randomIdx = Math.floor(Math.random() * problems.length);
  return problems[randomIdx];
}

async function generateGroqChallenge(problem: any, language: string, difficulty: string, apiKey: string) {
  const systemPrompt = `You are an expert game master generating a programming challenge.
You must output ONLY valid JSON. No markdown formatting outside of JSON. No explanations.
The user will provide a programming problem, a target language (${language}), and a difficulty (${difficulty}).
Your task:
1. Write a correct, robust, and clean shared codebase to solve the problem.
2. Generate 6 distinct private bug objectives. Each bug must represent a unique, isolated logical flaw or vulnerability that a developer needs to fix.
3. For each bug, define the "objective" (what the developer is told to fix), the "bugId", and the "sectionCode" (a snippet of the shared codebase with the bug injected). Ensure that the "sectionCode" is a self-contained function or class that fits into the overall codebase.

Ensure the difficulty (${difficulty}) dictates the subtlety of the bugs.

Output JSON format:
{
  "sharedCode": "string (the complete working codebase without bugs)",
  "tasks": [
    {
      "bugId": "string (unique id, e.g. 'bug-auth-1')",
      "objective": "string (description of the bug and goal)",
      "sectionCode": "string (the specific buggy code snippet assigned to this developer, with the bug INJECTED)"
    }
  ] // Must have exactly 6 tasks
}`;

  const userPrompt = `Problem Title: ${problem.title}\nDescription: ${problem.description}\nLanguage: ${language}\nDifficulty: ${difficulty}`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const rawJson = data.choices[0].message.content;
  return JSON.parse(rawJson);
}

export function apiPlugin(): Plugin {
  return {
    name: 'among-devs-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Parse JSON body helper
        const getBody = () => new Promise<any>((resolve, reject) => {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); }
            catch (e) { resolve({}); }
          });
        });

        if (req.method === 'POST' && req.url === '/api/start-game') {
          try {
            const body = await getBody();
            const { roomId, playerIds, language, difficulty } = body;
            
            // Load apiKey from vite environment
            // @ts-ignore
            const apiKey = process.env.VITE_BHAGUBHAI;
            if (!apiKey) throw new Error('API Key not found on server.');

            console.log(`[API] Starting game for room ${roomId} with ${playerIds.length} players...`);
            
            const problem = await readRandomProblem();
            console.log(`[API] Selected Problem: ${problem.title}`);

            const generated = await generateGroqChallenge(problem, language || 'JavaScript', difficulty || 'Medium', apiKey);
            
            if (!generated || !generated.tasks || generated.tasks.length === 0) {
              throw new Error('Groq failed to generate valid tasks.');
            }

            // Assign tasks to players.
            // Players get randomly assigned to rooms 1-6. We have up to 6 tasks.
            const assignments: Record<string, any> = {};
            const availableTasks = [...generated.tasks];
            const roomLabels = ['ENGINE ROOM', 'AUTH LAB', 'DATABASE CORE', 'UI TERMINAL', 'NETWORK HUB', 'SECURITY WING'];
            
            playerIds.forEach((playerId: string, index: number) => {
               // Assign a task
               const task = availableTasks[index % availableTasks.length];
               const roomLabel = roomLabels[index % roomLabels.length];
               assignments[playerId] = {
                 ...task,
                 assignedRoomId: roomLabel.toLowerCase().replace(/\\s+/g, '_'),
                 roomLabel,
               };
            });

            // Store authoritative state
            gameStateStore.set(roomId, {
              sharedCode: generated.sharedCode,
              language,
              difficulty,
              problem: problem.title,
              assignments
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (error: any) {
            console.error('[API Error /start-game]', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
          return;
        }

        if (req.method === 'GET' && req.url?.startsWith('/api/get-task')) {
          try {
            const url = new URL(req.url, \`http://\${req.headers.host}\`);
            const roomId = url.searchParams.get('roomId');
            const playerId = url.searchParams.get('playerId');

            if (!roomId || !playerId) {
               res.statusCode = 400;
               res.end(JSON.stringify({ success: false, error: 'Missing roomId or playerId' }));
               return;
            }

            const state = gameStateStore.get(roomId);
            if (!state) {
               res.statusCode = 404;
               res.end(JSON.stringify({ success: false, error: 'Game state not found for this room.' }));
               return;
            }

            const playerTask = state.assignments[playerId];
            
            res.setHeader('Content-Type', 'application/json');
            if (!playerTask) {
               // Player is a spectator or not assigned a task
               res.end(JSON.stringify({ success: true, task: null, sharedCode: state.sharedCode }));
               return;
            }

            // Send back ONLY this player's task
            res.end(JSON.stringify({ 
              success: true, 
              sharedCode: state.sharedCode,
              task: {
                 taskId: playerTask.bugId,
                 roomId: playerTask.assignedRoomId,
                 roomLabel: playerTask.roomLabel,
                 title: \`Fix \${state.problem}\`,
                 description: playerTask.objective,
                 sectionCode: playerTask.sectionCode,
                 baselineCode: playerTask.sectionCode, // initial code
                 status: 'ASSIGNED'
              }
            }));
          } catch (error: any) {
            console.error('[API Error /get-task]', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
          return;
        }

        next();
      });
    }
  }
}
