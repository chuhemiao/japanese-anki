
export interface VocabularyCard {
  id: string; // Client-side unique ID
  japanese: string;
  english: string; // English meaning, kept for card generation but might not be displayed on back
  exampleSentenceJapanese: string;
  exampleSentenceEnglish: string;
  partOfSpeech: string;
  jlptLevel: string;
  cardImageUri?: string;
  chineseMeaning?: string;
  exampleSentenceChinese?: string;
  // New field for etymology/origin details
  details_wordOrigin?: string;
  isLearned?: boolean; // For tracking learned status
}
