# Task i18n-2: Update main view components to use i18n translation system

## Work Log

- Updated 6 view components to use `useTranslation()` hook from `@/lib/i18n`
- Added `import { useTranslation } from '@/lib/i18n'` and `const { t } = useTranslation()` to each component
- **dashboard-view.tsx**: Replaced 18 hardcoded strings with t.dashboard.* keys (title, totalTasks, activeProjects, inProgress, completionRate, vsLastWeek, weeklyActivity, sprintBurndown, viewDetails, activeTasks, inProgressLabel, recentActivity, upcoming, seeAll, projectProgress, viewAllProjects, tasks, upcomingDeadlines)
- **tasks-view.tsx**: Replaced hardcoded strings in 4 sub-components (TaskCard, KanbanView, ListView, TasksView) with t.tasks.* keys. Removed `label` from statusConfig/priorityConfig, created inline translation maps (sl/pl) inside each component
- **projects-view.tsx**: Replaced hardcoded strings in 3 sub-components (ProjectGridCard, ProjectListRow, ProjectsView) with t.projects.* keys. Removed `label` from statusConfig, created inline statusLabels maps. Updated select dropdown items
- **reports-view.tsx**: Replaced 12 hardcoded strings with t.reports.* keys. Used t.dashboard.vsLastPeriod for "vs last period". Added missing `cn` import
- **members-view.tsx**: Replaced hardcoded strings with t.members.* keys. Removed `label` from roleConfig, created inline roleLabels map. Updated role filter buttons and status display
- **automations-view.tsx**: Replaced hardcoded strings with t.automations.* keys (title, createAutomation, totalAutomations, active, totalRuns, activeLabel, disabled, ran, times, last, edit, duplicate, runNow, delete)
- Fixed variable shadowing issues where filter callbacks used `(t)` parameter shadowing the `t` from useTranslation() - renamed to `(task)`
- Lint passes clean with no errors

## Summary

All 6 main view components are fully internationalized. Default locale is 'fr' (French). All existing functionality and styling preserved. No modifications to the translations file.
