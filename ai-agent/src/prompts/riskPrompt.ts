export const riskPrompt = (
  travelData: any
) => `
You are a Women's Travel Safety AI.

Analyze the travel behavior.

Travel Data:
${JSON.stringify(
  travelData,
  null,
  2
)}

Check:

1. Route deviation
2. Unexpected stop
3. Delayed arrival
4. SOS activation

Return JSON:

{
  "riskLevel":"",
  "reason":"",
  "action":""
}
`;