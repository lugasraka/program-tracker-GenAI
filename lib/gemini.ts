import { GoogleGenAI } from "@google/genai";

export type ActionItem = {
  description: string;
  owner: string;
  due: string;
  workstream: string;
  priority: "High" | "Medium" | "Low";
};

export type Risk = {
  description: string;
  severity: "High" | "Medium" | "Low";
  workstream: string;
  mitigation: string;
};

export type Dependency = {
  description: string;
  dependsOn: string;
  blocking: string;
  workstream: string;
  status: "On track" | "At risk" | "Blocked";
};

export type Decision = {
  description: string;
  madeBy: string;
  date: string;
};

export type OpenQuestion = {
  question: string;
  raisedBy: string;
  workstream: string;
};

export type SynthesisResult = {
  programName: string;
  decisions: Decision[];
  actions: ActionItem[];
  risks: Risk[];
  dependencies: Dependency[];
  openQuestions: OpenQuestion[];
  momentum: "Accelerating" | "Steady" | "Slowing";
  momentumReason: string;
  execSummary: {
    headline: string;
    statusByWorkstream: { workstream: string; status: "On track" | "At risk" | "Off track"; note: string }[];
    topRisks: string[];
    asks: string[];
  };
};

const synthesisSchema = {
  type: "object",
  properties: {
    programName: { type: "string" },
    decisions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          madeBy: { type: "string" },
          date: { type: "string" },
        },
        required: ["description", "madeBy", "date"],
      },
    },
    actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          owner: { type: "string" },
          due: { type: "string" },
          workstream: { type: "string" },
          priority: { type: "string", enum: ["High", "Medium", "Low"] },
        },
        required: ["description", "owner", "due", "workstream", "priority"],
      },
    },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          severity: { type: "string", enum: ["High", "Medium", "Low"] },
          workstream: { type: "string" },
          mitigation: { type: "string" },
        },
        required: ["description", "severity", "workstream", "mitigation"],
      },
    },
    dependencies: {
      type: "array",
      items: {
        type: "object",
        properties: {
          description: { type: "string" },
          dependsOn: { type: "string" },
          blocking: { type: "string" },
          workstream: { type: "string" },
          status: { type: "string", enum: ["On track", "At risk", "Blocked"] },
        },
        required: ["description", "dependsOn", "blocking", "workstream", "status"],
      },
    },
    openQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          raisedBy: { type: "string" },
          workstream: { type: "string" },
        },
        required: ["question", "raisedBy", "workstream"],
      },
    },
    momentum: { type: "string", enum: ["Accelerating", "Steady", "Slowing"] },
    momentumReason: { type: "string" },
    execSummary: {
      type: "object",
      properties: {
        headline: { type: "string" },
        statusByWorkstream: {
          type: "array",
          items: {
            type: "object",
            properties: {
              workstream: { type: "string" },
              status: { type: "string", enum: ["On track", "At risk", "Off track"] },
              note: { type: "string" },
            },
            required: ["workstream", "status", "note"],
          },
        },
        topRisks: { type: "array", items: { type: "string" } },
        asks: { type: "array", items: { type: "string" } },
      },
      required: ["headline", "statusByWorkstream", "topRisks", "asks"],
    },
  },
  required: [
    "programName",
    "decisions",
    "actions",
    "risks",
    "dependencies",
    "openQuestions",
    "momentum",
    "momentumReason",
    "execSummary",
  ],
} as const;

const systemPrompt = `You are a senior technical program management copilot for the Google Search Sustainable Journeys program space (Travel Impact Model, contrail avoidance, Search sustainability).

You will receive raw program input: status updates, meeting notes, transcripts, or Slack-style threads. Extract a structured, auditable synthesis.

Rules:
- Extract ONLY what is supported by the input. Never invent owners, dates, or risks. If a field is unknown, use "Unassigned" / "TBD" rather than guessing.
- Dates: normalize to ISO format (YYYY-MM-DD) when a date is stated or clearly inferable; otherwise "TBD".
- Workstream: assign each item to a short workstream label (e.g. "Partner data ingestion", "Model v2 rollout", "Contrail avoidance trial", "Regional compliance - EU/CH"). Reuse the same labels consistently for the same workstream.
- Prefer fewer, higher-signal items over exhaustive noise. Merge duplicates.
- The execSummary is for a busy executive: headline is one sentence, status notes are one sentence each, asks are concrete and directed at a specific audience (e.g. "Engineering: confirm partner API sandbox availability by Sep 20").
- Output must be valid against the provided schema. Return empty arrays when a category has no items.`;

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });
  }
  return client;
}

export async function synthesizeProgram(input: string): Promise<SynthesisResult> {
  const ai = getClient();
  const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input,
    system_instruction: systemPrompt,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: synthesisSchema,
    },
  });

  const text = interaction.output_text ?? "";
  if (!text) {
    throw new Error("Model returned no text output.");
  }
  const parsed = JSON.parse(text) as SynthesisResult;
  return parsed;
}
