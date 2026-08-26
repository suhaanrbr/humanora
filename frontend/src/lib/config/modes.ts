export interface WritingMode {
  name: string;
  description: string;
}

export const writingModes: WritingMode[] = [
  { name: "Natural", description: "Fluid everyday writing without unnecessary polish." },
  { name: "Academic", description: "Structured, precise writing appropriate for academic contexts." },
  { name: "Professional", description: "Clear workplace and business communication." },
  { name: "Concise", description: "Remove unnecessary wording while preserving meaning." },
  { name: "Casual", description: "Relaxed conversational writing." },
  { name: "Persuasive", description: "Stronger argument structure while maintaining the original intent." },
];
