/**
 * One-click samples for the homepage's live tells checker (TellsLab).
 * Three AI-flavoured drafts in the registers people most often bring,
 * and one paragraph written the way a person writes, so a visitor can
 * see the checker stay quiet on clean prose too. tellsSamples.test.ts
 * holds each sample to that behaviour.
 */
export interface TellsSample {
  id: string;
  label: string;
  /** True for the deliberately human-written sample. */
  human?: boolean;
  text: string;
}

export const TELLS_SAMPLES: TellsSample[] = [
  {
    id: "marketing",
    label: "Marketing copy",
    text: "In today's fast-paced digital landscape, it is important to note that effective communication plays a crucial role in success. Teams must leverage robust tools to foster collaboration. A clear, concise, and compelling message can unlock new opportunities. Ultimately, the right approach depends on a variety of factors.",
  },
  {
    id: "essay",
    label: "Student essay",
    text: "In today's digital age, social media plays a pivotal role in shaping public opinion. It is worth noting that these platforms connect people, spark debate, and drive engagement. Their rise serves as a testament to the power of technology. Ultimately, their impact depends on a variety of factors.",
  },
  {
    id: "cover-letter",
    label: "Cover letter",
    text: "I am writing to express my keen interest in the Marketing Coordinator position. I am confident that I can seamlessly leverage my skills to drive meaningful growth for your team. I am passionate, dedicated, and detail-oriented. I look forward to the opportunity to contribute my unwavering commitment to your organization.",
  },
  {
    id: "human",
    label: "Written by a person",
    human: true,
    text: "I rewrote the intro three times. The first version buried the point under a paragraph about our history, which nobody had asked for. Now it opens with the number: support tickets fell by a third in March. Everything else can wait until page two.",
  },
];
