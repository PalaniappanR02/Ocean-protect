import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { SocialSignalCard } from '@/components/features/SocialSignalCard';
import { StatCard } from '@/components/features/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { socialService } from '@/services';
import { useToast } from '@/hooks/useToast';
import { Radio, TrendingUp, AlertTriangle, Twitter, CheckCircle2, XCircle, Import } from 'lucide-react';
import { useState, useMemo } from 'react';
import SearchFilters from '@/components/list/SearchFilters';
import { useRealtime } from '@/hooks/useRealtime';

const PLATFORMS = ['all', 'twitter', 'facebook', 'instagram', 'news', 'reddit', 'youtube'] as const;
type PlatformFilter = (typeof PLATFORMS)[number];

export function SocialSignalsPage() {
  useRealtime();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [importText, setImportText] = useState('');
  const [importLocation, setImportLocation] = useState('');
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState<PlatformFilter>('all');

  const { data: signals, isLoading } = useQuery({
    queryKey: ['social-signals', platform],
    queryFn: () => socialService.list({ minRelevance: 50, platform: platform === 'all' ? undefined : platform }),
  });

  const { data: trends } = useQuery({
    queryKey: ['social-trends'],
    queryFn: () => socialService.getTrends(),
  });

  const importMutation = useMutation({
    mutationFn: (input: { text: string; locationName?: string }) => socialService.importSignal(input),
    onSuccess: (signal) => {
      toast({ title: 'Signal imported', description: `Classified as ${signal.hazardType ?? 'other'} with relevance ${signal.relevanceScore}%.`, variant: 'success' });
      setImportText('');
      setImportLocation('');
      void queryClient.invalidateQueries({ queryKey: ['social-signals'] });
      void queryClient.invalidateQueries({ queryKey: ['social-trends'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (input: { id: string; status: 'confirmed' | 'dismissed' }) => socialService.review(input.id, input.status),
    onSuccess: (_data, variables) => {
      toast({ title: variables.status === 'confirmed' ? 'Signal confirmed' : 'Signal dismissed', variant: 'success' });
      void queryClient.invalidateQueries({ queryKey: ['social-signals'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Review failed', description: error.message, variant: 'destructive' });
    },
  });

  const filtered = useMemo(() => {
    if (!signals) return [];
    const q = search.trim().toLowerCase();
    if (!q) return signals;
    return signals.filter((s) => (s.content || '').toLowerCase().includes(q) || (s.authorDisplayName || '').toLowerCase().includes(q));
  }, [signals, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Social Media Signals"
        description="AI-analyzed social media posts about coastal hazards"
        icon={Radio}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Signals" value={trends?.totalSignals || 0} icon={Radio} color="ocean" />
        <StatCard label="Relevant" value={trends?.relevantSignals || 0} icon={TrendingUp} color="green" />
        <StatCard label="High Urgency" value={trends?.highUrgency || 0} icon={AlertTriangle} color="red" />
        <StatCard label="Possible Misinfo" value={trends?.highMisinfo ?? 0} icon={AlertTriangle} color="amber" />
      </div>

      {trends?.topKeywords?.length ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              Trending keywords (recent signals)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {trends.topKeywords.slice(0, 12).map(({ word, frequency }) => (
              <Badge key={word} variant="outline" className="gap-1 border-ocean-500/30 text-ocean-300">
                {word}
                <span className="font-mono text-[10px] text-muted-foreground">×{frequency}</span>
              </Badge>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Import className="h-4 w-4" aria-hidden="true" />
            Manual social import (multilingual NLP)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              placeholder="Paste a social post or news snippet in English, Tamil, Malayalam, Kannada or Telugu…"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-56">
            <Input
              placeholder="Location name (optional)"
              value={importLocation}
              onChange={(e) => setImportLocation(e.target.value)}
            />
          </div>
          <Button
            onClick={() => importMutation.mutate({ text: importText, locationName: importLocation || undefined })}
            disabled={importMutation.isPending || importText.trim().length < 5}
          >
            {importMutation.isPending ? 'Classifying…' : 'Import & classify'}
          </Button>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchFilters value={search} onChange={setSearch} onClear={() => setSearch('')} placeholder="Search signals..." />
        <div className="ml-auto flex flex-wrap gap-1.5" role="group" aria-label="Filter by platform">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              aria-pressed={platform === p}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                platform === p
                  ? 'border-ocean-500 bg-ocean-500/10 text-ocean-300'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(filtered || []).map((signal) => (
          <div key={signal.id} className="glass-panel p-3">
            <SocialSignalCard signal={signal} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {typeof signal.misinfoScore === 'number' && signal.misinfoScore >= 0.5 && (
                <Badge variant="destructive" className="border-amber-500/50 text-amber-300">
                  <AlertTriangle className="mr-1 h-3 w-3" aria-hidden="true" />
                  Possible misinformation
                </Badge>
              )}
              {typeof signal.engagementScore === 'number' && signal.engagementScore > 0 && (
                <Badge variant="outline" className="text-muted-foreground">
                  Engagement {Math.round(signal.engagementScore * 100)}%
                </Badge>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <Badge
                variant="outline"
                className={
                  signal.reviewStatus === 'confirmed'
                    ? 'border-green-500/40 text-green-400'
                    : signal.reviewStatus === 'dismissed'
                      ? 'border-slate-600 text-slate-500'
                      : 'border-amber-500/40 text-amber-400'
                }
              >
                {signal.reviewStatus === 'confirmed' ? 'Confirmed' : signal.reviewStatus === 'dismissed' ? 'Dismissed' : 'Pending review'}
              </Badge>
              {signal.reviewStatus !== 'confirmed' && signal.reviewStatus !== 'dismissed' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500/40 text-green-400 hover:bg-green-500/10"
                    onClick={() => reviewMutation.mutate({ id: signal.id, status: 'confirmed' })}
                    disabled={reviewMutation.isPending}
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-400 hover:bg-slate-800"
                    onClick={() => reviewMutation.mutate({ id: signal.id, status: 'dismissed' })}
                    disabled={reviewMutation.isPending}
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
