export const emergencyPrompt = (
  incident: any
) => `
You are an Emergency Safety Coordinator.

Incident:

${JSON.stringify(
  incident,
  null,
  2
)}

Generate:

1. Risk Severity
2. Immediate Action
3. Who should be notified
4. Safety Recommendation

Return JSON.
`;