# Viewport-locked grid shell with no user-resizable panels

The desktop game view previously sized the Field and side Panels with independent `vw`/`vh` values (including a `120vh` Field Panel) that didn't sum to `100%` and could be pushed further out of bounds by a manual drag-to-resize handle on the Field Panel - guaranteeing overflow on desktop rather than merely risking it.

The shell is now a CSS Grid sized to exactly `100dvh` minus the header's height, with no page-level scroll; each Panel scrolls its own content internally. The drag-to-resize handle is removed. We considered keeping resize for power users, but a manually resizable Panel reintroduces the same class of "layout math the user can break" bug this decision exists to close, in exchange for a feature nobody asked for - Panel visibility can already be toggled (see `CONTEXT.md`'s Panel definition), which covers the actual need (more room for the Field Panel).
