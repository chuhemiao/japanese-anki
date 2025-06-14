
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Lightbulb } from 'lucide-react';
import { generateStory } from '@/ai/flows/generate-story-flow';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  theme: z.string().min(3, { message: 'Story theme must be at least 3 characters long.' }),
});
type FormData = z.infer<typeof FormSchema>;

export function StoryGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setGeneratedStory(null);
    try {
      const result = await generateStory({ theme: data.theme });
      setGeneratedStory(result.story);
      toast({
        title: 'Story Generated!',
        description: 'Your new story is ready.',
      });
      // Do not reset the form input so user can see the theme they used
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">AI Story Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="theme" className="text-sm font-medium">Story Theme</Label>
            <Input
              id="theme"
              type="text"
              {...register('theme')}
              placeholder="e.g., A lost cat in Kyoto, Magical ramen shop"
              className="mt-1"
              aria-invalid={errors.theme ? "true" : "false"}
            />
            {errors.theme && <p className="text-sm text-destructive mt-1">{errors.theme.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            Generate Story
          </Button>
        </form>

        {isLoading && (
          <div className="mt-6 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {generatedStory && !isLoading && (
          <div className="mt-6 space-y-2">
            <Label htmlFor="generated-story" className="text-sm font-medium">Generated Story:</Label>
            <Textarea
              id="generated-story"
              value={generatedStory}
              readOnly
              rows={10}
              className="mt-1 bg-muted/30"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
