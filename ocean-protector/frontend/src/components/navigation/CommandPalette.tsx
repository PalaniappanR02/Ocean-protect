import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CornerDownLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleNavigation } from '@/navigation/useRoleNavigation';
import type { CommandPaletteCommand, PortalRole } from '@/navigation/navigation.types';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

interface CommandPaletteContextValue {
  open: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | undefined>(undefined);

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext);
  return ctx ?? { open: () => undefined };
}

function fuzzyMatch(command: CommandPaletteCommand, query: string): boolean {
  const haystack = [command.label, ...(command.keywords ?? [])].join(' ').toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

/**
 * Cmd/Ctrl+K command palette. Commands are generated from the user's actual
 * role permissions (the centralized navigation config) — inaccessible routes
 * never appear. G-sequence shortcuts (e.g. G then R) work only when the nav
 * config declares them for the role.
 */
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const navigate = useNavigate();
  const { commands } = useRoleNavigation(role as PortalRole | null);
  const [openState, setOpenState] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const lastGKey = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const open = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    setOpenState(true);
  }, []);

  const runCommand = useCallback(
    (command: CommandPaletteCommand) => {
      setOpenState(false);
      navigate(command.to);
    },
    [navigate],
  );

  const filtered = useMemo(() => {
    const list = query.trim() ? commands.filter((c) => fuzzyMatch(c, query)) : commands;
    return list;
  }, [commands, query]);

  // Reset highlight when the filtered list shrinks.
  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  // Focus the input whenever the dialog opens.
  useEffect(() => {
    if (openState) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
    }
  }, [openState]);

  // Global keyboard: Cmd/Ctrl+K opens; G then <key> runs a declared shortcut.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (openState) setOpenState(false);
        else open();
        return;
      }

      if (openState || typing) return;

      if (event.key.toLowerCase() === 'g') {
        lastGKey.current = Date.now();
        return;
      }

      const lastG = lastGKey.current;
      if (lastG && Date.now() - lastG < 900) {
        lastGKey.current = 0;
        const shortcut = `G ${event.key.toUpperCase()}`;
        const match = commands.find((c) => c.shortcut === shortcut);
        if (match) {
          event.preventDefault();
          runCommand(match);
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openState, open, commands, runCommand]);

  const onKeyDownList = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (filtered.length === 0 ? 0 : (index + 1) % filtered.length));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (filtered.length === 0 ? 0 : (index - 1 + filtered.length) % filtered.length));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const command = filtered[activeIndex];
      if (command) runCommand(command);
    }
  };

  return (
    <CommandPaletteContext.Provider value={{ open }}>
      {children}
      <Dialog open={openState} onOpenChange={setOpenState}>
        <DialogContent
          className="gap-0 overflow-hidden p-0"
          aria-describedby={undefined}
          onKeyDown={onKeyDownList}
        >
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <DialogDescription className="sr-only">
            Jump to any page your role can access.
          </DialogDescription>

          <div className="flex items-center gap-3 border-b px-4">
            <Command className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              placeholder="Type a command…"
              aria-label="Search commands"
              className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-list"
              aria-activedescendant={filtered[activeIndex] ? `command-${filtered[activeIndex].id}` : undefined}
            />
          </div>

          <div className="max-h-[min(60vh,26rem)] overflow-y-auto p-2" id="command-list" role="listbox">
            {filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No commands for “{query}”.
              </p>
            ) : (
              filtered.map((command, index) => {
                const Icon = command.icon;
                const active = index === activeIndex;
                return (
                  <button
                    key={command.id}
                    id={`command-${command.id}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => runCommand(command)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none',
                      active ? 'bg-ocean-400/10 text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-ocean-400" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground/90">{command.label}</span>
                    {command.shortcut && (
                      <kbd className="rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[10px]">{command.shortcut}</kbd>
                    )}
                    {active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </CommandPaletteContext.Provider>
  );
}
