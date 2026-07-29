import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Radio } from 'lucide-react';
import type { SocialSignal } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

export function SocialSignalCard({ signal }: { signal: SocialSignal }) {
  return <Card><CardContent className="p-4"><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Radio className="h-4 w-4 text-ocean-400" /><span className="text-sm font-medium text-white">{signal.authorDisplayName}</span></div><Badge variant="outline">{signal.platform}</Badge></div><p className="line-clamp-4 text-sm text-slate-300">{signal.content}</p><div className="mt-3 flex flex-wrap gap-1">{signal.keywordsMatched?.slice(0,4).map(k=><Badge key={k} variant="secondary" className="text-[10px]">{k}</Badge>)}</div><div className="mt-3 flex items-center justify-between text-xs text-slate-500"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{signal.locationName || 'Unknown location'}</span><span>{formatRelativeTime(signal.observedAt)}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded bg-slate-900 p-2">Relevance <strong className="float-right text-ocean-300">{signal.relevanceScore}%</strong></div><div className="rounded bg-slate-900 p-2">Urgency <strong className="float-right text-red-300">{signal.urgencyScore}%</strong></div></div></CardContent></Card>;
}
