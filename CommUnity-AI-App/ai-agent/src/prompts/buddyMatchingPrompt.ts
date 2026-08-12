export const buddyMatchingPrompt = (
  source: string,
  destination: string,
  time: string
) => `
You are CommUnity AI.

Find the best verified female travel buddy.

Journey Details:
Source: ${source}
Destination: ${destination}
Time: ${time}

Matching Rules:
1. Similar route
2. Similar departure time
3. High trust score
4. Verified account

Return:
- Match Score
- Trust Score
- Reason for Match
`;