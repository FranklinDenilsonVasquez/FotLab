# Incremental Tailwind adoption, scoped to the shell and the three Panels

The frontend has always used plain per-component CSS files with no shared tokens - a direct contributor to the layout bugs fixed in ADR 0002 (the same fixed pixel/viewport values duplicated and drifting across files). Rather than rewrite the whole frontend's styling in one pass, Tailwind is being adopted only for the app shell, Header, and the three Panels (Field, GameList, Standings) touched by this UI/UX overhaul; Footer, PlayerCard, and WeekScroller keep their existing CSS files until they're next substantially touched.

This means the codebase will carry both Tailwind utility classes and legacy per-component CSS files side by side for a while - a future reader should not assume this is an oversight or "finish the migration" without cause; it was a deliberate scope boundary to keep this pass focused on the components that actually needed fixing.
