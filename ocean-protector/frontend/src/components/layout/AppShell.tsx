import { Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <>
      <a
        href="#main-content"
        className="nav-pill fixed left-4 top-4 z-50 -translate-y-24 px-4 py-3 font-semibold transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>
      <Outlet />
    </>
  );
}
