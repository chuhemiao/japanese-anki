'use client';

import { generateCardImage } from '@/ai/flows/generate-card-image';
import { generateWordOrigin } from '@/ai/flows/generate-word-origin';
import { AuthButtons } from '@/components/auth-button';
import { FlashcardView } from '@/components/flashcard-view';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import defaultVocabulary from '@/data/vocabulary.json';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase'; // Import db
import type { VocabularyCard } from '@/types';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where
} from 'firebase/firestore'; // Firestore imports
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  CheckSquare,
  Loader2,
  RefreshCw,
  UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function NihongoDrillPage() {
  const [cards, setCards] = useState<VocabularyCard[]>(defaultVocabulary);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGeneratingOrigin, setIsGeneratingOrigin] = useState(false);
  const { toast } = useToast();
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [availableLevels, setAvailableLevels] = useState<string[]>([
    'All',
    'N5',
    'N4'
  ]);
  const [cardImages, setCardImages] = useState<Record<string, string>>({});
  const [isGeneratingImageForCardId, setIsGeneratingImageForCardId] = useState<
    string | null
  >(null);

  const { user, loading: authLoading } = useAuth();

  // Fetch learned status for initial cards if user is logged in
  useEffect(() => {
    const fetchLearnedStatuses = async () => {
      if (user && cards.length > 0) {
        const learnedWordsColRef = collection(
          db,
          `users/${user.uid}/learnedWords`
        );
        const cardIds = cards.map((c) => c.id);
        // Firestore 'in' query limit is 30, chunk if necessary for very large default sets
        const chunks = [];
        for (let i = 0; i < cardIds.length; i += 30) {
          chunks.push(cardIds.slice(i, i + 30));
        }

        const learnedIds = new Set<string>();
        for (const chunk of chunks) {
          if (chunk.length > 0) {
            const q = query(learnedWordsColRef, where('__name__', 'in', chunk)); // __name__ refers to document ID
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((docSnap) => learnedIds.add(docSnap.id));
          }
        }

        setCards((prevCards) =>
          prevCards.map((card) => ({
            ...card,
            isLearned: learnedIds.has(card.id)
          }))
        );
      }
    };
    if (!authLoading) {
      fetchLearnedStatuses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); // Only re-run if user or authLoading changes, not cards

  useEffect(() => {
    const allLevels = new Set<string>(['All']);
    cards.forEach((card) => {
      if (
        card.jlptLevel &&
        (card.jlptLevel === 'N5' || card.jlptLevel === 'N4')
      ) {
        allLevels.add(card.jlptLevel);
      }
    });
    const displayLevels = Array.from(allLevels)
      .filter((level) => level === 'All' || level === 'N5' || level === 'N4')
      .sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        return a.localeCompare(b);
      });
    setAvailableLevels(displayLevels);
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (selectedLevel === 'All') {
      return cards;
    }
    return cards.filter((card) => card.jlptLevel === selectedLevel);
  }, [cards, selectedLevel]);

  const currentCard = useMemo(() => {
    return filteredCards.length > 0 ? filteredCards[currentCardIndex] : null;
  }, [filteredCards, currentCardIndex]);

  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [selectedLevel, filteredCards.length]);

  useEffect(() => {
    if (
      currentCard &&
      !cardImages[currentCard.id] &&
      isGeneratingImageForCardId !== currentCard.id
    ) {
      const fetchImage = async () => {
        setIsGeneratingImageForCardId(currentCard.id);
        try {
          const result = await generateCardImage({
            japaneseWord: currentCard.japanese,
            englishMeaning: currentCard.english
          });
          setCardImages((prev) => ({
            ...prev,
            [currentCard.id!]: result.imageDataUri
          }));
        } catch (error) {
          console.error('Error generating card image:', error);
        } finally {
          setIsGeneratingImageForCardId(null);
        }
      };
      fetchImage();
    }
  }, [currentCard, cardImages, isGeneratingImageForCardId]);

  const handleNextCard = () => {
    if (filteredCards.length <= 1) return; // If 0 or 1 card, do nothing

    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * filteredCards.length);
    } while (newIndex === currentCardIndex); // Ensure the new card is different from the current one

    setCurrentCardIndex(newIndex);
    setIsFlipped(false);
    // Clear details for the new card if they were fetched for the previous one
    const cardToClearDetails = filteredCards[newIndex];
    if (cardToClearDetails && cardToClearDetails.details_wordOrigin) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardToClearDetails.id
            ? { ...c, details_wordOrigin: undefined }
            : c
        )
      );
    }
  };

  const handlePreviousCard = () => {
    if (filteredCards.length === 0) return;
    setCurrentCardIndex(
      (prevIndex) =>
        (prevIndex - 1 + filteredCards.length) % filteredCards.length
    );
    setIsFlipped(false);
    if (currentCard && currentCard.details_wordOrigin) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === currentCard.id ? { ...c, details_wordOrigin: undefined } : c
        )
      );
    }
  };

  const handleFlipCard = () => {
    if (currentCard) {
      setIsFlipped((prev) => !prev);
    }
  };

  const handlePronounce = useCallback(
    (text: string, lang: string = 'ja-JP') => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          let japaneseVoice = voices.find((voice) => voice.lang === 'ja-JP');
          if (!japaneseVoice) {
            japaneseVoice = voices.find((voice) => voice.lang.startsWith('ja'));
          }
          if (japaneseVoice) {
            utterance.voice = japaneseVoice;
          }
        }
        window.speechSynthesis.speak(utterance);
      } else {
        toast({
          title: 'Error',
          description: 'Text-to-speech not supported in your browser.',
          variant: 'destructive'
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => window.speechSynthesis.getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, []);

  const handleGenerateWordOrigin = async () => {
    if (!currentCard) return;
    setIsGeneratingOrigin(true);
    try {
      const originData = await generateWordOrigin({
        word: currentCard.japanese
      });
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === currentCard.id
            ? { ...card, details_wordOrigin: originData.wordOrigin }
            : card
        )
      );
      toast({
        title: '词源信息已加载',
        description: `关于 "${currentCard.japanese}" 的词源信息现在可用。`
      });
    } catch (error) {
      console.error('Error generating word origin:', error);
      toast({
        title: '错误',
        description: '加载词源信息失败，请重试。',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingOrigin(false);
    }
  };

  const handleMarkAsLearned = async (cardId: string, learned: boolean) => {
    if (!user) {
      toast({
        title: 'Please Sign In',
        description: 'You need to be logged in to mark words as learned.',
        variant: 'destructive'
      });
      return;
    }

    const cardToUpdate = cards.find((c) => c.id === cardId);
    if (!cardToUpdate) return;

    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, isLearned: learned } : card
      )
    );

    try {
      const learnedWordRef = doc(db, `users/${user.uid}/learnedWords`, cardId);
      if (learned) {
        // Save essential card data. Exclude dynamic fields like cardImageUri if not needed for 'learned' list.
        const { cardImageUri, ...cardDataToSave } = cardToUpdate;
        await setDoc(learnedWordRef, { ...cardDataToSave, isLearned: true });
      } else {
        await deleteDoc(learnedWordRef);
      }
      toast({
        title: 'Status Updated',
        description: `"${cardToUpdate.japanese}" marked as ${
          learned ? 'learned' : 'not learned'
        }.`
      });
    } catch (error) {
      console.error('Error updating learned status in Firestore: ', error);
      // Revert optimistic UI update
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === cardId ? { ...card, isLearned: !learned } : card
        )
      );
      toast({
        title: 'Error',
        description: 'Could not update learned status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const currentCardImageUri = currentCard
    ? cardImages[currentCard.id]
    : undefined;
  const isCurrentlyGeneratingImage = currentCard
    ? isGeneratingImageForCardId === currentCard.id
    : false;
  const currentCardIsLearned = currentCard ? currentCard.isLearned : false;

  if (authLoading && !user) {
    // Show loader only if auth is loading and no user yet
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 space-y-6 sm:space-y-8 bg-gradient-to-br from-background to-purple-100 dark:to-purple-900/50'>
      <header className='w-full flex justify-between items-center px-2 sm:px-0'>
        <div className='text-center flex-grow'>
          <h1 className='font-headline text-4xl sm:text-5xl font-bold text-primary flex items-center justify-center gap-3'>
            🦌 AnkiRin
          </h1>
          <p className='text-muted-foreground mt-2 text-md sm:text-lg'>
            Master Japanese Vocabulary with AI-Powered Flashcards
          </p>
        </div>
        <div className='flex gap-2 items-center'>
          {user && (
            <>
              <Button variant='ghost' size='icon' asChild className='sm:hidden'>
                <Link href='/learned' aria-label='Learned Words'>
                  <CheckSquare className='h-5 w-5' />
                </Link>
              </Button>
              <Button
                variant='outline'
                size='sm'
                asChild
                className='hidden sm:flex'>
                <Link href='/learned' aria-label='Learned Words'>
                  <CheckSquare className='h-5 w-5' />{' '}
                  <span className='ml-1'>Learned</span>
                </Link>
              </Button>
              <Button variant='ghost' size='icon' asChild className='sm:hidden'>
                <Link href='/profile' aria-label='Profile'>
                  <UserCircle className='h-5 w-5' />
                </Link>
              </Button>
              <Button
                variant='outline'
                size='sm'
                asChild
                className='hidden sm:flex'>
                <Link href='/profile' aria-label='Profile'>
                  <UserCircle className='h-5 w-5' />{' '}
                  <span className='ml-1'>Profile</span>
                </Link>
              </Button>
            </>
          )}
          <AuthButtons />
        </div>
      </header>

      <div className='w-full max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col items-center space-y-6'>
        <Tabs
          value={selectedLevel}
          onValueChange={setSelectedLevel}
          className='w-full'>
          <TabsList className='flex w-full overflow-x-auto pb-1'>
            {availableLevels.map((level) => (
              <TabsTrigger
                key={level}
                value={level}
                className='flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm'>
                {level}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <FlashcardView
          cardData={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlipCard}
          onPronounce={handlePronounce}
          onGenerateWordOrigin={handleGenerateWordOrigin}
          isGeneratingOrigin={isGeneratingOrigin}
          cardImageUri={currentCardImageUri}
          isGeneratingImage={isCurrentlyGeneratingImage}
          isLearned={!!currentCardIsLearned} // Ensure boolean
          onMarkAsLearned={handleMarkAsLearned}
          isLoggedIn={!!user}
        />

        {filteredCards.length > 0 && (
          <div className='flex items-center space-x-2 sm:space-x-4 justify-center'>
            <Button
              variant='outline'
              size='lg'
              onClick={handlePreviousCard}
              aria-label='Previous card'
              disabled={isGeneratingOrigin || isCurrentlyGeneratingImage}>
              <ArrowLeftCircle className='h-5 w-5 sm:h-6 sm:w-6' />
            </Button>
            <Button
              variant='default'
              size='lg'
              onClick={handleFlipCard}
              className='min-w-[100px] sm:min-w-[120px]'
              aria-label='Flip card'
              disabled={isGeneratingOrigin || isCurrentlyGeneratingImage}>
              <RefreshCw className='mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5' />
              Flip
            </Button>
            <Button
              variant='outline'
              size='lg'
              onClick={handleNextCard}
              aria-label='Next card'
              disabled={isGeneratingOrigin || isCurrentlyGeneratingImage}>
              <ArrowRightCircle className='h-5 w-5 sm:h-6 sm:w-6' />
            </Button>
          </div>
        )}
        {filteredCards.length > 0 && (
          <p className='text-xs sm:text-sm text-muted-foreground text-center'>
            Card {currentCardIndex + 1} of {filteredCards.length}
          </p>
        )}
        {cards.length === 0 && (
          <p className='text-md text-muted-foreground mt-4 text-center'>
            No cards yet. Use the initial vocabulary.
          </p>
        )}
        {cards.length > 0 &&
          filteredCards.length === 0 &&
          selectedLevel !== 'All' && (
            <p className='text-md text-muted-foreground mt-4 text-center'>
              No cards for JLPT level "{selectedLevel}". Try 'All'.
            </p>
          )}
      </div>
      <Separator className='my-8 w-full max-w-4xl' />
      <footer className='text-center text-muted-foreground text-sm pb-8'>
        <p>&copy; {new Date().getFullYear()} AnkiRin. Powered by AI.</p>
      </footer>
    </div>
  );
}
