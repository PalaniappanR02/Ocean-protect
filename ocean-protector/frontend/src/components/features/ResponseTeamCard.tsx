import { Badge } from '@/components/ui/badge';
import { Phone, Users } from 'lucide-react';
export function ResponseTeamCard({ team }: { team: any }) {
  return <div><div className="flex items-start justify-between"><div><h3 className="font-semibold text-white">{team.name || 'Response Team'}</h3><p className="text-xs text-slate-500">{team.districtName || team.location?.districtName || 'Coastal district'}</p></div><Badge variant="outline">{team.status || 'standby'}</Badge></div><div className="mt-3 flex gap-4 text-xs text-slate-400"><span className="flex items-center gap-1"><Users className="h-3 w-3" />{team.memberCount || team.members?.length || 0} members</span>{team.contactNumber && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{team.contactNumber}</span>}</div></div>;
}
