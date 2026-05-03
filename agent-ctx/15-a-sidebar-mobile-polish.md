# Task 15-a: Sidebar & Mobile Polish Agent — Work Log

## Summary of Changes

### 1. Sidebar Enhancement (`src/components/app-sidebar.tsx`)

- **Gradient workspace switcher area**: Added `bg-gradient-to-b from-sidebar-accent/50 to-transparent` to the workspace switcher area for a subtle dark-to-lighter gradient effect
- **Quick Actions section**: Added 3 icon buttons between search and pinned items: "+ Task", "+ Project", "+ Meeting" with color-coded hover states (teal, amber, rose) that open the respective dialogs
- **Favorite amber left border**: When an item is favorited (starred) but not active, a subtle 1px amber/golden left border indicator appears
- **RECENT section**: Added a "RECENT" section showing last 3 recently visited pages with Clock icon, using the `recentItems` from the Zustand store. Also integrated `addRecentItem` on nav click.
- **Collapsible channels**: Made the channels section collapsible with a chevron icon that rotates on toggle. Uses Framer Motion AnimatePresence for smooth height animation.
- **Online status text**: Changed the online users section to show "X online, Y away" format instead of just "X online"
- **Touch targets**: Increased min-height to 44px for all nav items (`min-h-[44px]`) and 36px for channels/shortcuts
- **Pro badge**: Used `t.topbar.pro` translation key for the Pro badge in workspace switcher
- **New channel i18n**: Fixed the hardcoded "New channel" text to use `t.sidebar.newChannel` translation key

### 2. TopBar Enhancement (`src/components/top-bar.tsx`)

- **Gradient border-bottom**: Replaced flat border with `bg-gradient-to-r from-[oklch(0.55_0.15_160/0.4)] via-[oklch(0.55_0.15_160/0.1)] to-transparent` gradient line
- **Wider search bar**: Changed search bar from `w-60` to `w-72` on desktop, with animated focus ring using `ring-2 ring-[oklch(0.55_0.15_160/0.3)]` and Framer Motion width animation on focus
- **Pro badge in breadcrumbs**: Added a small "Pro" badge next to the workspace name in breadcrumbs with teal accent
- **"What's new" sparkle button**: Added a Sparkles icon button with amber color scheme and tooltip "TeamFlow v2.4 — See what's new"
- **Notification hover dropdown**: Replaced simple notification button with a Popover that shows last 3 notifications on hover/click with type icons, unread indicators, and "View all" button
- **Mobile responsive**: On mobile, action buttons show just icons (no text). Separate mobile user avatar button. Language toggle adapts to icon-only on small screens.

### 3. Main Layout Enhancement (`src/components/main-app.tsx`)

- **Dot-pattern background**: Added `dot-pattern` CSS class to the main content area
- **Gradient footer border**: Replaced flat border-top with `bg-gradient-to-r from-transparent via-[oklch(0.55_0.15_160/0.2)] to-transparent`
- **Back to top button**: Added a floating "Back to top" button (Framer Motion fade-in) that appears when scrolling down past 400px, with smooth scroll behavior
- **Mobile FAB**: Added a floating action button at bottom-right on mobile screens (lg:hidden) with expand/collapse animation. Shows 3 quick action buttons: +Task, +Project, +Meeting

### 4. i18n Translations (`src/lib/i18n/translations.ts`)

Added new translation keys for both FR and EN:
- `sidebar.quickActions`, `sidebar.quickTask`, `sidebar.quickProject`, `sidebar.quickMeeting`
- `sidebar.recent`, `sidebar.onlineCount`, `sidebar.awayCount`, `sidebar.newChannel`
- `topbar.pro`, `topbar.whatsNew`, `topbar.whatsNewTooltip`
- `footer.backToTop`

### 5. Lint & Build

- `bun run lint` passes with 0 errors
- App compiles and serves successfully on port 3000 (HTTP 200)
