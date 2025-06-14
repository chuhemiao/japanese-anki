
'use server';
/**
 * @fileOverview Generates etymological or cultural origin information for a Japanese word, in Chinese.
 *
 * - generateWordOrigin - A function that handles the word origin generation process.
 * - GenerateWordOriginInput - The input type for the generateWordOrigin function.
 * - GenerateWordOriginOutput - The return type for the generateWordOrigin function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWordOriginInputSchema = z.object({
  word: z.string().describe('The Japanese word to generate origin information for.'),
});
export type GenerateWordOriginInput = z.infer<typeof GenerateWordOriginInputSchema>;

const GenerateWordOriginOutputSchema = z.object({
  wordOrigin: z.string().describe('Interesting etymological information, origin details, or cultural context about the word, explained in Chinese. Focus on its roots and evolution if known. Avoid simply defining the word or providing example sentences.'),
});
export type GenerateWordOriginOutput = z.infer<typeof GenerateWordOriginOutputSchema>;

export async function generateWordOrigin(input: GenerateWordOriginInput): Promise<GenerateWordOriginOutput> {
  return generateWordOriginFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWordOriginPrompt',
  input: {schema: GenerateWordOriginInputSchema},
  output: {schema: GenerateWordOriginOutputSchema},
  prompt: `你是一位日语语言专家和词源学家。请为给定的日语单词提供有趣的词源信息、起源细节或文化背景，并用中文解释。
请侧重于其已知的词根和演变过程。避免仅仅定义单词或提供例句，因为这些信息在其他地方可以找到。
解释应简洁且引人入胜，适合在抽认卡上展示。

日语单词: {{{word}}}

词源信息 (中文解释): `,
});

const generateWordOriginFlow = ai.defineFlow(
  {
    name: 'generateWordOriginFlow',
    inputSchema: GenerateWordOriginInputSchema,
    outputSchema: GenerateWordOriginOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
