'use server';

/**
 * @fileOverview Generates a Japanese vocabulary flashcard with English and Chinese translations, example sentences, and detailed information.
 *
 * - generateVocabularyCard - A function that generates a vocabulary card.
 * - GenerateVocabularyCardInput - The input type for the generateVocabularyCard function.
 * - GenerateVocabularyCardOutput - The return type for the generateVocabularyCard function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVocabularyCardInputSchema = z.object({
  word: z.string().describe('The Japanese word to generate a flashcard for.'),
});
export type GenerateVocabularyCardInput = z.infer<typeof GenerateVocabularyCardInputSchema>;

const GenerateVocabularyCardOutputSchema = z.object({
  japanese: z.string().describe('The Japanese word.'),
  english: z.string().describe('The English translation of the word.'),
  chineseMeaning: z.string().describe('The Chinese meaning of the word.'),
  partOfSpeech: z
    .string()
    .describe(
      'The grammatical part of speech of the word (e.g., Noun, u-verb, ru-verb, i-adjective, na-adjective, Adverb, Particle, Pronoun, Interjection, Conjunction). Be specific and avoid "Unknown".'
    ),
  jlptLevel: z.string().describe('The JLPT level of the word (e.g., N5, N4, etc.).'),
  exampleSentenceJapanese: z
    .string()
    .describe('An example sentence using the word in Japanese.'),
  exampleSentenceEnglish: z.string().describe('The English translation of the Japanese example sentence.'),
  exampleSentenceChinese: z.string().describe('The Chinese translation of the Japanese example sentence.'),
});
export type GenerateVocabularyCardOutput = z.infer<typeof GenerateVocabularyCardOutputSchema>;

export async function generateVocabularyCard(input: GenerateVocabularyCardInput): Promise<
  GenerateVocabularyCardOutput
> {
  return generateVocabularyCardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVocabularyCardPrompt',
  input: {schema: GenerateVocabularyCardInputSchema},
  output: {schema: GenerateVocabularyCardOutputSchema},
  prompt: `You are an expert Japanese language tutor. Generate a comprehensive flashcard for the Japanese word: {{{word}}}.

Include the following information:
- japanese: The Japanese word.
- english: The English translation of the word.
- chineseMeaning: The Chinese meaning of the word.
- partOfSpeech: The grammatical part of speech of the word. Be specific (e.g., Noun, u-verb, ru-verb, i-adjective, na-adjective, Adverb, Particle, Pronoun, Interjection, Conjunction). Avoid using "Unknown". If the word can be multiple parts of speech, pick the most common one or list them separated by a slash.
- jlptLevel: The JLPT level of the word (e.g., N5, N4, N/A, etc.).
- exampleSentenceJapanese: An example sentence using the word in Japanese.
- exampleSentenceEnglish: The English translation of the Japanese example sentence.
- exampleSentenceChinese: The Chinese translation of the Japanese example sentence.

Make sure the example sentence is natural and useful for learning the word in context.
If JLPT level is not applicable or unknown after best effort, use "N/A".

Output in JSON format.`,
});

const generateVocabularyCardFlow = ai.defineFlow(
  {
    name: 'generateVocabularyCardFlow',
    inputSchema: GenerateVocabularyCardInputSchema,
    outputSchema: GenerateVocabularyCardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
