export interface LoveType {
  id: string;
  label: string;
  description: string;
  color: string;
  longDescription: string;
}
export const loveTypes: LoveType[] = [
  { id: "Eros", label: "Eros", description: "Sexual passion and romantic love", color: "#FF6F61", longDescription: "Eros represents passionate love, marked by strong physical and emotional attraction." },
  { id: "Philia", label: "Philia", description: "Deep friendship between equals", color: "#6B5B95", longDescription: "Philia signifies the love between friends based on mutual respect." },
  { id: "Ludus", label: "Ludus", description: "Playful or flirtatious love", color: "#88B04B", longDescription: "Ludus is playful love characterized by flirtation and excitement." },
  { id: "Agape", label: "Agape", description: "Unconditional, universal love", color: "#F7CAC9", longDescription: "Agape is selfless, unconditional love that accepts others without expectation." },
  { id: "Pragma", label: "Pragma", description: "Practical love based on reason", color: "#92A8D1", longDescription: "Pragma is practical love that develops over time through compromise." },
  { id: "Philautia", label: "Philautia", description: "Self-love and self-compassion", color: "#955251", longDescription: "Philautia is self-love, focusing on caring for oneself." },
  { id: "Storge", label: "Storge", description: "Natural affection between family", color: "#B565A7", longDescription: "Storge is familial love, the natural bond between family members." },
  { id: "Mania", label: "Mania", description: "Obsessive or possessive love", color: "#009B77", longDescription: "Mania is obsessive love characterized by extreme emotions and jealousy." }
];
