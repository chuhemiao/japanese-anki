
'use server';
/**
 * @fileOverview Generates an image for a flashcard based on the word and its meaning.
 *
 * - generateCardImage - A function that handles the image generation.
 * - GenerateCardImageInput - The input type for the generateCardImage function.
 * - GenerateCardImageOutput - The return type for the generateCardImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCardImageInputSchema = z.object({
  japaneseWord: z.string().describe('The Japanese word.'),
  englishMeaning: z.string().describe('The English meaning of the word.'),
});
export type GenerateCardImageInput = z.infer<typeof GenerateCardImageInputSchema>;

const GenerateCardImageOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateCardImageOutput = z.infer<typeof GenerateCardImageOutputSchema>;

export async function generateCardImage(input: GenerateCardImageInput): Promise<GenerateCardImageOutput> {
  return generateCardImageFlow(input);
}

const generateCardImageFlow = ai.defineFlow(
  {
    name: 'generateCardImageFlow',
    inputSchema: GenerateCardImageInputSchema,
    outputSchema: GenerateCardImageOutputSchema,
  },
  async ({ japaneseWord, englishMeaning }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
      prompt: `Create an image designed to help memorize the Japanese word "${japaneseWord}" (which means "${englishMeaning}"). 
The image should visually represent the core concept of "${englishMeaning}" in a clear, memorable, and artistic manner. 
If "${englishMeaning}" has multiple common meanings or could be effectively illustrated through a symbolic scene, a metaphor, or a visual pun, please incorporate such elements to enhance recall. 
The style should be artistic and visually appealing, suitable as a subtle background for a flashcard, ensuring it does not distract from overlaid text. 
Crucially, avoid including any text or letters in the image itself. 
Focus on a symbolic, conceptual, or imaginative representation that makes the meaning of "${japaneseWord}" easier to remember.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or did not return a URL.');
    }
    return { imageDataUri: media.url };
  }
);
