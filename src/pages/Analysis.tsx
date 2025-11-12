import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/context/AccountContext';
import { AnalysisForm } from '@/components/analysis/AnalysisForm';
import type { AnalysisEntry, AnalysisInput } from '@/types/analysis';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createAnalysisEntry, deleteAnalysisEntry, fetchAnalysisEntries } from '@/lib/supabase/analysis';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Image as ImageIcon } from 'lucide-react';

export default function Analysis() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? user?.uid ?? null;
  const { selectedAccount } = useAccount();

  const { data: entries = [], isLoading, error } = useQuery<AnalysisEntry[]>({
    queryKey: ['analysis', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      return await fetchAnalysisEntries(userId);
    },
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: AnalysisInput) => {
      if (!userId) throw new Error('User not authenticated');
      return await createAnalysisEntry(userId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis', userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      if (!userId) throw new Error('User not authenticated');
      await deleteAnalysisEntry(userId, entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis', userId] });
    },
  });

  const groupedEntries = useMemo(() => {
    const groups: Record<string, AnalysisEntry[]> = {};
    entries.forEach((entry) => {
      if (!groups[entry.type]) groups[entry.type] = [];
      groups[entry.type].push(entry);
    });
    return groups;
  }, [entries]);

  return (
    <div className="content-spacing">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analysis Library</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Store trade forecasts and weekly analysis notes. Entries are shared across all of your accounts.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
        <AnalysisForm
          onSubmit={async (input) => {
            await createMutation.mutateAsync(input);
          }}
          isSubmitting={createMutation.isPending}
        />

        <Card>
          <CardHeader>
            <CardTitle>Saved Analysis</CardTitle>
            <CardDescription>
              {selectedAccount
                ? `Viewing entries for ${selectedAccount.name} (universal library)`
                : 'Entries apply to all accounts.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading analysis entries…</p>
            ) : error ? (
              <p className="text-sm text-destructive">
                {error instanceof Error ? error.message : 'Failed to load analysis entries.'}
              </p>
            ) : entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No analysis saved yet. Use the form to add your forecasts or weekly notes.
              </p>
            ) : (
              Object.entries(groupedEntries).map(([type, notes]) => (
                <div key={type} className="mb-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    {type === 'forecast' ? 'Trade Forecasts' : 'Weekly Analysis'}
                  </h2>
                  <div className="space-y-3">
                    {notes.map((entry) => (
                      <div key={entry.id} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-base">{entry.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteMutation.mutate(entry.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {entry.imageUrl ? (
                          <div className="rounded-md overflow-hidden border border-border/60">
                            <img src={entry.imageUrl} alt={entry.title} className="w-full object-cover" />
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <ImageIcon className="h-3 w-3" />
                            No image uploaded
                          </div>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-line">{entry.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

