
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-word-origin.ts'; // Updated to new flow
import '@/ai/flows/generate-vocabulary-card.ts';
import '@/ai/flows/generate-card-image.ts';
// Removed: import '@/ai/flows/generate-card-details.ts';
// Removed: import '@/ai/flows/generate-story-flow.ts'; - if story generator was also removed from page.tsx
// Assuming generate-story-flow was removed in a previous step as per "去掉导入和ai story generator"

