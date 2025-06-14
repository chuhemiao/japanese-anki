"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlusCircle } from 'lucide-react';
import type { VocabularyCard } from '@/types';
import { generateVocabularyCard } from '@/ai/flows/generate-vocabulary-card';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  word: z.string().min(1, { message: 'Japanese word cannot be empty.' }),
});
type FormData = z.infer<typeof FormSchema>;

interface CardGeneratorProps {
  onCardGenerated: (card: VocabularyCard) => void;
}

export function CardGenerator({ onCardGenerated }: CardGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      const generatedData = await generateVocabularyCard({ word: data.word });
      const newCard: VocabularyCard = {
        id: crypto.randomUUID(),
        ...generatedData,
      };
      onCardGenerated(newCard);
      toast({
        title: 'Success!',
        description: `Flashcard for "${data.word}" generated.`,
      });
      reset();
    } catch (error) {
      console.error('Error generating card:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate flashcard. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Generate New Card</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="word" className="text-sm font-medium">Japanese Word</Label>
            <Input
              id="word"
              type="text"
              {...register('word')}
              placeholder="e.g., 猫, 食べる"
              className="mt-1"
              aria-invalid={errors.word ? "true" : "false"}
            />
            {errors.word && <p className="text-sm text-destructive mt-1">{errors.word.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Generate Card
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
