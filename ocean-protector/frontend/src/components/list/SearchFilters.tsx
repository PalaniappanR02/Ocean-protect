import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export const SearchFilters: React.FC<Props> = ({ value, onChange, placeholder = 'Search...', onClear }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input aria-label="Search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9" />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onClear?.()} aria-label="Clear search">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SearchFilters;
