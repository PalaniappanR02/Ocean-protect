import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type Role = 'citizen' | 'analyst' | 'authority';

export function RoleSwitcher({ role }: { role: Role }) {
  return (
    <div
      className="role-switcher hidden min-h-10 items-center p-1 sm:flex"
      role="group"
      aria-label="Switch OceanGuard portal"
    >
      {(['citizen', 'analyst', 'authority'] as const).map((item) => (
        <Link
          key={item}
          to={`/${item}`}
          aria-current={role === item ? 'page' : undefined}
          className={cn(
            'role-switcher__item inline-flex min-h-8 items-center px-3 text-xs font-semibold capitalize',
          )}
        >
          {item}
        </Link>
      ))}
    </div>
  );
}
