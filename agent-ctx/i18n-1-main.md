# Task i18n-1: Update Three Components with i18n Translation System

## Task Summary
Integrated the existing i18n translation system into three core components: `app-sidebar.tsx`, `top-bar.tsx`, and `login-page.tsx`.

## Files Modified

### 1. `/home/z/my-project/src/components/app-sidebar.tsx`
- Added `import { useTranslation } from '@/lib/i18n'`
- Added `const { t } = useTranslation();` inside `AppSidebar` component
- Created `getNavLabel(pageId)` helper to dynamically resolve nav labels from `t.nav[pageId]`
- Replaced all hardcoded strings:
  - Section labels: "Pinned" → `t.sidebar.pinned`, "Main" → `t.sidebar.main`, "Collaborate" → `t.sidebar.collaborate`, "Channels" → `t.sidebar.channels`, "Manage" → `t.sidebar.manage`
  - Search: "Search..." → `t.sidebar.search`
  - Workspace dropdown: "Workspaces" → `t.sidebar.workspaces`, "Create workspace" → `t.sidebar.createWorkspace`, "Join workspace" → `t.sidebar.joinWorkspace`
  - Members count: "members" → `t.sidebar.members`
  - Online users: "online" → `t.sidebar.online`
  - Settings: "Settings" → `t.nav.settings`
  - Nav item labels: Now use `getNavLabel(item.pageId)` which maps to `t.nav.*` keys

### 2. `/home/z/my-project/src/components/top-bar.tsx`
- Added `import { useTranslation } from '@/lib/i18n'`
- Added `locale` and `setLocale` from `useAppStore`
- Added `const { t } = useTranslation();`
- Replaced `pageNames` static object with `getPageName(page)` helper using `t.nav[page]`
- Added **language switcher button** (FR/EN toggle) next to theme toggle:
  - Shows current locale in uppercase (FR/EN)
  - Tooltip shows the opposite language name
  - Styled like the theme toggle (ghost button, icon size)
- Replaced all hardcoded strings:
  - "Search..." → `t.topbar.search`
  - "Quick create" → `t.topbar.quickCreate`
  - "Toggle theme" → `t.topbar.toggleTheme`
  - "Expand sidebar" / "Collapse sidebar" → `t.topbar.expandSidebar` / `t.topbar.collapseSidebar`
  - "Notifications" → `t.topbar.notifications`
  - "new" → `t.topbar.new`
  - "View all notifications" → `t.topbar.viewAll`
  - "Profile" → `t.topbar.profile`
  - "Settings" → `t.topbar.settings`
  - "Sign out" → `t.topbar.signOut`

### 3. `/home/z/my-project/src/components/login-page.tsx`
- Added `import { useTranslation } from '@/lib/i18n'`
- Added `locale` and `setLocale` from `useAppStore`
- Added `const { t } = useTranslation();`
- Added **language toggle button** in top-right corner (absolute positioned)
- Replaced all hardcoded strings:
  - "Welcome back" → `t.login.welcomeBack`
  - "Enter your credentials..." → `t.login.subtitle`
  - "Email" → `t.login.email`
  - "Password" → `t.login.password`
  - "Forgot password?" → `t.login.forgotPassword`
  - "Sign in" → `t.login.signIn`
  - "Signing in..." → `t.login.signingIn`
  - "or continue with" → `t.login.orContinueWith`
  - "Don't have an account?" → `t.login.noAccount`
  - "Create one" → `t.login.createOne`
  - "Please enter your credentials" → `t.login.enterCredentials`
  - "Manage projects." → `t.login.leftTitle1`
  - "Empower teams." → `t.login.leftTitle2`
  - Left subtitle → `t.login.leftSubtitle`
  - Feature titles/descriptions → `t.login.feature1Title`, `t.login.feature1Desc`, etc.

## Verification
- `bun run lint` passes with no errors
- Dev server compiles successfully
- All existing functionality preserved
- No styling or layout changes
