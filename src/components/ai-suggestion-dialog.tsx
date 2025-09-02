'use client';
import { useState } from 'react';
import { suggestBiomassTypes } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';
import { Icons } from './icons';
import { Skeleton } from './ui/skeleton';
import type { BiomassType } from '@/lib/types';
import { BIOMASS_TYPES } from '@/lib/types';
import type { SuggestBiomassTypesOutput } from '@/ai/flows/suggest-biomass-types';


type AiSuggestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AiSuggestionDialog({ open, onOpenChange }: AiSuggestionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestBiomassTypesOutput | null>(null);
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await suggestBiomassTypes(
        BIOMASS_TYPES as unknown as BiomassType[],
        "Geospatial data of biomass sources including location, type, and quantity."
      );
      setSuggestion(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "AI Suggestion Failed",
        description: "Could not get suggestions. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <Icons.ai className="mr-2 h-5 w-5 text-primary" />
            AI Biomass Suggestions
          </AlertDialogTitle>
          <AlertDialogDescription>
            Let our AI analyze current trends and suggest new biomass types to track.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {isLoading && (
            <div className="space-y-4 my-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )}
        
        {suggestion && (
            <div className="my-4 text-sm">
                <h4 className="font-semibold mb-2">Suggested New Types:</h4>
                <ul className="list-disc pl-5 space-y-1">
                    {suggestion.suggestedTypes.map((type) => (
                        <li key={type}>{type}</li>
                    ))}
                </ul>
                <h4 className="font-semibold mt-4 mb-2">Reasoning:</h4>
                <p className="text-muted-foreground">{suggestion.reasoning}</p>
            </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <Button onClick={handleGetSuggestion} disabled={isLoading}>
            {isLoading ? "Thinking..." : suggestion ? "Regenerate" : "Get Suggestions"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
