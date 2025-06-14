
"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Loader2, CheckCircle, Circle, BookOpen, MessageSquareText } from 'lucide-react';
import type { VocabularyCard } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface FlashcardViewProps {
  cardData: VocabularyCard | null;
  isFlipped: boolean;
  onFlip: () => void;
  onPronounce: (text: string, lang: string) => void;
  onGenerateWordOrigin: () => Promise<void>;
  isGeneratingOrigin: boolean;
  cardImageUri?: string;
  isGeneratingImage?: boolean;
  isLearned?: boolean;
  onMarkAsLearned: (cardId: string, learned: boolean) => void;
  isLoggedIn: boolean;
}

export function FlashcardView({
  cardData,
  isFlipped,
  onFlip,
  onPronounce,
  onGenerateWordOrigin,
  isGeneratingOrigin,
  cardImageUri,
  isGeneratingImage,
  isLearned,
  onMarkAsLearned,
  isLoggedIn,
}: FlashcardViewProps) {
  if (!cardData) {
    return (
      <Card className="w-full max-w-lg h-80 sm:h-96 flex items-center justify-center shadow-xl bg-muted/50">
        <CardContent>
          <p className="text-lg sm:text-xl text-muted-foreground font-headline">No card to display for this level.</p>
        </CardContent>
      </Card>
    );
  }

  const FrontContentInternal = () => (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-6 text-center">
      <h2 className="font-headline text-4xl sm:text-5xl mb-3 sm:mb-4" lang="ja">{cardData.japanese}</h2>
      <p className="text-muted-foreground text-md sm:text-lg">({cardData.partOfSpeech} - {cardData.jlptLevel})</p>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => { e.stopPropagation(); onPronounce(cardData.japanese, 'ja-JP'); }}
        aria-label={`Pronounce ${cardData.japanese}`}
        className="mt-4 sm:mt-6 text-primary hover:text-primary/80"
      >
        <Volume2 className="h-7 w-7 sm:h-8 sm:w-8" />
      </Button>
    </div>
  );

  const BackContentInternal = () => (
    <div className="flex flex-col h-full p-3 sm:p-4 space-y-3">
      {/* Word Origin Section - MOVED TO TOP & CENTERED */}
      <div className="flex flex-col items-center justify-start w-full">
        {cardData.details_wordOrigin ? (
          <ScrollArea className="h-36 sm:h-48 w-full p-1 border rounded-md shadow-inner bg-background/30 dark:bg-background/40">
            <div className="p-2 sm:p-3 w-full text-sm" lang="zh-CN">
              <h4 className="font-semibold text-accent mb-1.5 text-md text-center">词源信息:</h4>
              <p className="text-foreground/90 dark:text-foreground/80 leading-relaxed whitespace-pre-wrap text-left">{cardData.details_wordOrigin}</p>
            </div>
          </ScrollArea>
        ) : (
           <Button
              variant="outline"
              size="lg" 
              onClick={(e) => { e.stopPropagation(); onGenerateWordOrigin(); }}
              disabled={isGeneratingOrigin}
              aria-label="Explore word origin (Chinese)"
              className="border-accent text-accent hover:bg-accent/10 hover:text-accent py-3 px-6 w-full text-md"
            >
              {isGeneratingOrigin ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BookOpen className="mr-2 h-5 w-5" />}
              探索词源 (中文)
            </Button>
        )}
      </div>

      <Separator className="my-2" />

      {/* Chinese Meaning - Centered */}
      {cardData.chineseMeaning && (
        <div className="text-center">
          <h3 className="font-headline text-xl sm:text-2xl text-primary flex items-center justify-center">
             <MessageSquareText className="inline h-5 w-5 mr-2 shrink-0" />
            {cardData.chineseMeaning}
          </h3>
        </div>
      )}

      {/* Japanese Example Sentence - Left Aligned */}
      {cardData.exampleSentenceJapanese && (
        <div className="text-left">
          <h4 className="font-semibold text-sm text-foreground/80 mb-0.5">例:</h4>
          <p className="text-md font-medium text-foreground" lang="ja">{cardData.exampleSentenceJapanese}</p>
        </div>
      )}
      
      {/* Spacer to push Learned Button to the bottom */}
      <div className="flex-grow"></div> 

      {/* Learned Button */}
      {isLoggedIn && (
        <div className="w-full pt-1">
          <Button
            variant={isLearned ? "secondary" : "default"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsLearned(cardData.id, !isLearned);
            }}
            className="w-full text-xs py-2"
            aria-label={isLearned ? "Mark as not learned" : "Mark as learned"}
          >
            {isLearned ? <CheckCircle className="mr-1.5 h-4 w-4" /> : <Circle className="mr-1.5 h-4 w-4" />}
            {isLearned ? 'Marked as Learned' : 'Mark as Learned'}
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="w-full max-w-lg h-80 sm:h-96 perspective cursor-pointer group"
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? `Showing details for ${cardData.japanese}` : `Showing Japanese: ${cardData.japanese}. Click to flip.`}
    >
      <Card
        className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ease-in-out shadow-xl group-hover:shadow-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
        style={cardImageUri ? {
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url(${cardImageUri})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        <div className={`absolute inset-0 w-full h-full rounded-lg dark:bg-black/50 ${cardImageUri ? 'dark:bg-opacity-60' : 'dark:bg-opacity-0'}`} />

        <div className="absolute w-full h-full backface-hidden">
           <div 
            className="w-full h-full bg-card/80 dark:bg-transparent backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-1 relative"
          >
            <FrontContentInternal />
             {isGeneratingImage && !cardImageUri && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div 
            className="w-full h-full bg-card/80 dark:bg-transparent backdrop-blur-sm rounded-lg flex flex-col items-start justify-between overflow-hidden p-2 sm:p-3 relative"
          >
            <BackContentInternal />
            {isGeneratingImage && !cardImageUri && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
