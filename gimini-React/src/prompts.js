const getTranscriptAnalysisPrompt = (transcript) => `
You are tasked with analyzing a YouTube video transcript to evaluate its scientific accuracy.
Return your response as a **JSON object**, not HTML.
Follow this structure:
{
  "title": "Short summary title of the transcript",
  "sections": [
    {
      "heading": "Section Title",
      "points": [
        {
          "text": "Statement from transcript",
          "validity": "valid" | "invalid",
          "explanation": "Explanation if invalid, or null if valid"
        }
        ...
      ]
    }
    ...
  ]
}
Instructions:
- For each scientifically meaningful statement in the transcript:
  - Mark it as **valid** or **invalid**
  - If invalid, provide a short, correct scientific explanation
- Ignore personal anecdotes or unrelated info
- Structure your output to group related statements into meaningful sections

Video Title: ${transcript.videoTitle}
Transcript for analysis:
${transcript.transcript}

Respond ONLY with a valid JSON object in the format above.
`;

const getNotesPrompt = (transcript) => `
You are given a YouTube video transcript. Your task is to convert it into **well-structured notes** in a clean and structured **JSON format** — not HTML.

The notes should be educational, concise, and organized with a hierarchy of topics and subtopics.

### Output Format (JSON)

Return the result in this structure:

{
  "title": "Overall topic/title of the video",
  "sections": [
    {
      "heading": "Main section or topic",
      "points": [
        {
          "text": "Key point or idea",
          "explanation": "Optional expanded explanation, explain more by your own in more depth or context, or null if none"
        }
      ]
    },
    ...
  ]
}

### Guidelines:

1. add the **main title** for the notes from the transcript which is provided below.
2. Group related information under appropriate **section headings**.
3. Each section should contain a list of **key points**.
4. Provide **explanations** when helpful to expand or clarify a point.
5. If a point doesn't need explanation, set the explanation field to **null**.
6. Skip unrelated, filler, or non-informative parts of the transcript.

Video Title: ${transcript.videoTitle}
Transcript for analysis:
${transcript.transcript}

Respond ONLY with a valid JSON object in the format above.`;

const getSummaryPrompt = (transcript) => `
You are an expert summarizer. Your task is to read the following YouTube transcript and generate a clear, concise, and informative summary.

Instructions:
- Capture the main ideas and key takeaways.
- Use bullet points for clarity if needed.
- Focus only on important, valuable content.
- Do not include filler, intros, or outros unless crucial.
- Be concise but complete.
- Ensure the output is valid JSON (no comments or extra text).
- Maintain proper escaping for all strings.
- Return ONLY a valid JSON object with the following format:
{
  "title": "Title of the video",
  "summary": "Concise and informative summary of the entire video",
  "keyPoints": [
    "Bullet point 1 summarizing a major insight",
    "Bullet point 2 summarizing another insight",
    "..."
  ],
  "targetAudience": "Who would benefit most from this video?",
  "application": "Where or how this information can be applied",
  "tone": "Tone of the video e.g. educational, motivational, casual, technical",
}


Here is the video information:
Video Title: ${transcript.videoTitle}
Transcript:
${transcript.transcript}

Respond ONLY with a valid JSON object as described above.
`;

export { getTranscriptAnalysisPrompt, getNotesPrompt, getSummaryPrompt };
