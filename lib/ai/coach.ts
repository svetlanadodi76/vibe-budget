import Anthropic from "@anthropic-ai/sdk";

interface CategorySummary {
  name: string;
  total: number;
  percentage: number;
}

interface MonthSummary {
  month: string;
  income: number;
  expenses: number;
}

export interface CoachInput {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categories: CategorySummary[];
  months: MonthSummary[];
}

export interface CoachResult {
  healthScore: number;
  healthExplanation: string;
  tips: string[];
  positiveObservation: string;
}

export async function analyzeFinances(input: CoachInput): Promise<CoachResult> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const categoryLines = input.categories
    .map((c) => `  - ${c.name}: ${c.total.toFixed(2)} MDL (${c.percentage.toFixed(1)}%)`)
    .join("\n");

  const monthLines = input.months
    .map((m) => `  - ${m.month}: venituri ${m.income.toFixed(2)} MDL, cheltuieli ${m.expenses.toFixed(2)} MDL`)
    .join("\n");

  const prompt = `Ești un coach financiar personal care analizează datele financiare ale unui utilizator din Moldova.

Date financiare pentru perioada: ${input.period}
- Total venituri: ${input.totalIncome.toFixed(2)} MDL
- Total cheltuieli: ${input.totalExpenses.toFixed(2)} MDL
- Balanță: ${input.balance.toFixed(2)} MDL

Cheltuieli pe categorii:
${categoryLines || "  (nicio cheltuială înregistrată)"}

Trend lunar:
${monthLines || "  (date insuficiente)"}

Răspunde EXCLUSIV în format JSON valid, fără text în afara JSON-ului. Structura:
{
  "healthScore": <număr întreg 0-100>,
  "healthExplanation": "<explicație scurtă 1-2 propoziții în română>",
  "tips": ["<sfat 1>", "<sfat 2>", "<sfat 3>"],
  "positiveObservation": "<observație pozitivă în română>"
}

Reguli pentru health score:
- 80-100: cheltuieli < 70% din venituri, economii pozitive
- 60-79: cheltuieli 70-85% din venituri
- 40-59: cheltuieli 85-100% din venituri
- 0-39: cheltuieli > venituri (balanță negativă)

Sfaturile trebuie să fie specifice datelor reale (menționează categoriile concrete). Scrie în română.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Extrage JSON din răspuns
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Răspuns invalid de la AI");
  }

  const parsed = JSON.parse(jsonMatch[0]) as CoachResult;
  return parsed;
}
