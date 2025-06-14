
"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileImporterProps {
  onFileUploaded: (fileContent: string) => Promise<void>;
}

export function FileImporter({ onFileUploaded }: FileImporterProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type !== 'application/json') {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a JSON file.',
        variant: 'destructive',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        await onFileUploaded(content);
      } catch (error) { 
        console.error("Error processing file:", error);
        toast({
          title: 'Import Error',
          description: 'Could not process the imported file.',
          variant: 'destructive',
        });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''; 
        }
      }
    };

    reader.onerror = () => {
      toast({
        title: 'File Read Error',
        description: 'Could not read the selected file.',
        variant: 'destructive',
      });
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center">Import Vocabulary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Upload a JSON file with your vocabulary list. Each item should be an object with at least "japanese" and "english" keys.
          </p>
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
            id="file-upload-input"
            disabled={isImporting}
          />
          <Button onClick={handleImportClick} className="w-full" disabled={isImporting}>
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            {isImporting ? 'Importing...' : 'Select JSON File'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
