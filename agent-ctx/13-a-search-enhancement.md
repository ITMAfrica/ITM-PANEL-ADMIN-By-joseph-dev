## Task 13-a: Search Enhancement & Connection Status

### Completed Changes

#### 1. Zustand Store (`src/lib/store.ts`)
- Added `recentItems: string[]` state initialized with `['dashboard', 'tasks', 'messages']`
- Added `addRecentItem` action that adds page ID to front of array, removes duplicates, and limits to 8 items

#### 2. i18n Translations (`src/lib/i18n/translations.ts`)
- Added FR/EN keys:
  - `search.recent`: FR="Récents" / EN="Recent"
  - `search.toggleTheme`: FR="Changer de thème" / EN="Toggle Theme"
  - `search.showShortcuts`: FR="Afficher les raccourcis" / EN="Show Shortcuts"
  - `search.startTyping`: FR="Commencez à taper pour rechercher..." / EN="Start typing to search..."

#### 3. Enhanced Search Dialog (`src/components/search-dialog.tsx`)
- **Recent section**: When query is empty, shows "Recent" CommandGroup at top with Clock icons and page names
- **Quick Actions section**: Added "Toggle Theme" and "Show Keyboard Shortcuts" actions alongside existing task/project/meeting actions. Actions now trigger actual dialogs (createTaskDialogOpen, createProjectDialogOpen, shortcutsHelpOpen) and theme toggle
- **Visual improvements**:
  - Sparkle icon (✦) in placeholder text
  - Teal accent border on focus via `focus:border-[oklch(0.55_0.15_160/0.3)]`
  - Better empty state with Search icon and "Start typing to search..." message
  - Subtle CommandSeparator dividers between result groups
- Navigation tracks recent items via `addRecentItem` on page selection

#### 4. Connection Status Component (`src/components/connection-status.tsx`)
- New component that monitors connection health
- Periodic health check every 30 seconds via `HEAD /api/tasks`
- Listens to browser online/offline events
- Shows animated amber banner with "Connection lost" and Retry button when offline
- Retry button has spinning animation during check
- Uses Framer Motion AnimatePresence for smooth entry/exit

#### 5. Main App Integration (`src/components/main-app.tsx`)
- Imported and rendered `<ConnectionStatus />` at top level
- Wrapped return in React fragment to accommodate both ConnectionStatus and main div

### Lint Result
- 0 errors, clean pass
