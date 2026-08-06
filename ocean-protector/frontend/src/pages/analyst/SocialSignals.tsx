import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { SocialSignalCard } from '@/components/features/SocialSignalCard';
import { StatCard } from '@/components/features/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { socialService } from '@/services';
import { Radio, TrendingUp, AlertTriangle, Twitter } from 'lucide-react';
import { useState, useMemo } from 'react';
import SearchFilters from '@/components/list/SearchFilters';

export function SocialSignalsPage() {
  const { data: signals, isLoading } = useQuery({
    queryKey: ['social-signals'],
    queryFn: () => socialService.list({ minRelevance: 50 }),
  });

  const { data: trends } = useQuery({
    queryKey: ['social-trends'],
    queryFn: () => socialService.getTrends(),
  });

  const [search, setSearch] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ocean-500 border-t-transparent" />
      </div>
    );
  }

  const filtered = useMemo(() => {
    if (!signals) return [];
    const q = search.trim().toLowerCase();
    if (!q) return signals;
    return signals.filter(s => (s.content||'').toLowerCase().includes(q) || (s.authorDisplayName||'').toLowerCase().includes(q));
  }, [signals, search]);

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
        <StatCard label="Matched to Incidents" value={signals?.filter((s) => s.matchedIncidentId).length || 0} icon={Twitter} color="amber" />
      </div>

      {/* Top Keywords */}
      {trends?.topKeywords && trends.topKeywords.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Trending Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trends.topKeywords.map((kw, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {kw.keyword} <span className="ml-1 text-muted-foreground">({kw.count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-4">
        <SearchFilters value={search} onChange={setSearch} onClear={()=>setSearch('')} placeholder="Search signals..." />
      </div>

      {/* Signals */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(filtered || []).map((signal) => (
          <div key={signal.id} className="glass-panel p-3">
            <SocialSignalCard signal={signal} />
          </div>
        ))}
      </div>
    </div>
  );
}