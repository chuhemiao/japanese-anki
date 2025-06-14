
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2, BookOpen } from 'lucide-react';
import type { VocabularyCard } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, deleteDoc, orderBy } from 'firebase/firestore';

export default function LearnedWordsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [learnedCards, setLearnedCards] = useState<VocabularyCard[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchLearnedWords = async () => {
      if (user) {
        setPageLoading(true);
        try {
          const q = query(collection(db, `users/${user.uid}/learnedWords`), orderBy("japanese")); // Assuming 'japanese' field exists for ordering
          const querySnapshot = await getDocs(q);
          const cardsFromDb: VocabularyCard[] = querySnapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id, 
            ...(docSnapshot.data() as Omit<VocabularyCard, 'id' | 'isLearned'>),
            isLearned: true, 
          }));
          setLearnedCards(cardsFromDb);
        } catch (error) {
          console.error("Error fetching learned words: ", error);
          toast({ title: "Error", description: "Could not fetch learned words. Please try again.", variant: "destructive" });
        } finally {
          setPageLoading(false);
        }
      } else if (!authLoading) {
        setPageLoading(false); // No user, stop loading
      }
    };

    if (!authLoading && user) {
      fetchLearnedWords();
    } else if (!authLoading && !user) {
      setPageLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, toast]); // Added toast to dependency array

  const handleRemoveLearnedWord = async (cardId: string) => {
    if (!user) return;
    
    const originalCards = [...learnedCards];
    setLearnedCards(prev => prev.filter(card => card.id !== cardId)); // Optimistic UI update

    try {
      await deleteDoc(doc(db, `users/${user.uid}/learnedWords`, cardId));
      toast({ title: "Success", description: "Word removed from your learned list." });
    } catch (error) {
      console.error("Error removing learned word: ", error);
      setLearnedCards(originalCards); // Revert on error
      toast({ title: "Error", description: "Could not remove word. Please try again.", variant: "destructive" });
    }
  };

  if (authLoading || (pageLoading && user)) { // Show loader if auth is loading OR (page is loading AND there's a user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    // Redirect handled by useEffect, this is a fallback or if redirection is slow.
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center mt-10">
        <p className="text-xl mb-4">Redirecting to sign-in...</p>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary font-headline">My Learned Words</h1>
        <Button asChild variant="outline">
          <Link href="/">
            <BookOpen className="mr-2 h-4 w-4" /> Back to Flashcards
          </Link>
        </Button>
      </div>

      {learnedCards.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">You haven't marked any words as learned yet.</p>
          <p className="text-sm text-muted-foreground mb-6">Start by exploring flashcards and marking words you've mastered!</p>
          <Button asChild size="lg">
            <Link href="/">Start Learning Now</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {learnedCards.map(card => (
            <Card key={card.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl font-headline" lang="ja">{card.japanese}</CardTitle>
                <CardDescription className="text-md">{card.english}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-1 text-sm">
                <p><span className="font-semibold">Part of Speech:</span> {card.partOfSpeech}</p>
                <p><span className="font-semibold">JLPT Level:</span> {card.jlptLevel}</p>
                {card.chineseMeaning && <p><span className="font-semibold">Chinese:</span> {card.chineseMeaning}</p>}
              </CardContent>
              <div className="p-4 border-t mt-auto">
                 <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRemoveLearnedWord(card.id)} 
                    className="w-full"
                    aria-label={`Remove ${card.japanese} from learned words`}
                  >
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
