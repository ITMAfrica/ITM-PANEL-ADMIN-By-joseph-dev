# Task 13-b: Data Export Feature & AI Smart Suggestions Widget

## Task ID: 13-b
## Agent: main

## Work Completed

### 1. Export Utility Functions (`src/lib/export-utils.ts`)
- Created `objectsToCSV()` - converts array of objects to CSV format with proper RFC 4180 escaping (commas, quotes, newlines)
- Created `objectsToJSON()` - converts array of objects to JSON string
- Created `createCSVBlob()` / `createJSONBlob()` - creates proper Blob objects
- Created `downloadBlob()` - triggers browser download via URL.createObjectURL
- Created `exportToCSV()` / `exportToJSON()` - end-to-end export functions
- Created `copyToClipboard()` - uses navigator.clipboard.writeText()
- Created `formatTasksForExport()`, `formatProjectsForExport()`, `formatWorkloadForExport()` - formatters for each data type

### 2. Export API Route (`src/app/api/export/route.ts`)
- GET endpoint at `/api/export?format=csv&type=tasks|projects|workload`
- Queries Prisma database for tasks (with assignee/project relations), projects (with tasks), and teams (with member workload)
- Returns CSV with Content-Type text/csv and Content-Disposition header
- Returns JSON with Content-Type application/json and Content-Disposition header
- Proper error handling for invalid type parameter

### 3. AI Chat API Enhancement (`src/app/api/ai-chat/route.ts`)
- Added `suggestions` mode: when `{ mode: 'suggestions' }` is sent, generates 5 AI productivity suggestions
- Uses SUGGESTIONS_PROMPT that instructs AI to return JSON array with: id, icon, title, description, action, actionType
- Action types: create_task, view_project, schedule_meeting, review_task, check_deadline
- Falls back to FALLBACK_SUGGESTIONS when AI is unavailable or returns invalid JSON
- Preserved existing chat mode functionality

### 4. Smart Suggestions Hook (`src/hooks/use-smart-suggestions.ts`)
- Custom `useSmartSuggestions()` hook
- Returns: suggestions, isLoading, error, refresh()
- 5-minute client-side cache (CACHE_DURATION = 5 * 60 * 1000)
- Prevents concurrent fetches with isFetching ref
- Falls back to FALLBACK_SUGGESTIONS on error
- Exported SmartSuggestion type for consumer components

### 5. Reports View Export Dropdown (`src/components/views/reports-view.tsx`)
- Replaced simple "Export" button with DropdownMenu containing:
  - Tasks section: Export as CSV, Export as JSON, Copy to Clipboard
  - Projects section: Export as CSV, Export as JSON, Copy to Clipboard
  - Workload section: Export as CSV, Export as JSON, Copy to Clipboard
- Each section has a colored label header and proper icons (FileSpreadsheet, FileJson, Clipboard, Check)
- Copy to Clipboard shows "Copied!" with checkmark for 2 seconds after copying
- Uses existing teal gradient button styling for the trigger

### 6. Dashboard Smart Suggestions Card (`src/components/views/dashboard-view.tsx`)
- Added Smart Suggestions card in the bottom row grid (2-col span next to Time Tracker)
- Card design: gradient accent background (teal/emerald), Sparkles icon with teal accent container
- Header: title + description + Refresh button with spin animation
- Loading state: 3 skeleton rows with pulse animation + "AI is generating suggestions..." text
- Each suggestion: emoji icon in teal container, title, description, action button on hover
- Staggered entrance animation (delay: 0.05 + idx * 0.05)
- Action buttons navigate to appropriate pages (create_task → dialog, view_project → projects, etc.)
- Scrollable content (max-h-[260px])

### 7. i18n Translation Keys (`src/lib/i18n/translations.ts`)
- FR and EN added to `reports`: exportTasks, exportProjects, exportWorkload, exportAsCSV, exportAsJSON, copyToClipboard, copied
- FR and EN added to `dashboard`: suggestionsTitle, suggestionsDescription, suggestionsRefresh, suggestionsLoading, suggestionsActionCreateTask, suggestionsActionViewProject, suggestionsActionScheduleMeeting, suggestionsActionReviewTask, suggestionsActionCheckDeadline

## Verification
- `bun run lint` passes with 0 errors
- Dev server compiles successfully
- App returns 200 on port 3000
