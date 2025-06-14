
'use server';
/**
 * @fileOverview Generates an interesting story based on a theme, incorporating local culture and anime style.
 *
 * - generateStory - A function that handles the story generation process.
 * - GenerateStoryInput - The input type for the generateStory function.
 * - GenerateStoryOutput - The return type for the generateStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryInputSchema = z.object({
  theme: z.string().describe('The theme for the story.'),
});
export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

const GenerateStoryOutputSchema = z.object({
  story: z.string().describe('The generated story.'),
});
export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateStory(input: GenerateStoryInput): Promise<GenerateStoryOutput> {
  return generateStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryPrompt',
  input: {schema: GenerateStoryInputSchema},
  output: {schema: GenerateStoryOutputSchema},
  prompt: `You are a master storyteller, renowned for weaving captivating narratives that blend local culture with the vibrant spirit of anime.
Based on the theme "{{{theme}}}", craft an interesting and imaginative story.
Ensure the story incorporates elements of Japanese local culture (e.g., festivals, food, folklore, everyday life) and evokes an anime-inspired atmosphere (e.g., expressive characters, dynamic scenes, a touch of wonder or adventure).
The story should be well-structured with a clear beginning, middle, and end, and suitable for a general audience.`,
});

const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStoryFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
