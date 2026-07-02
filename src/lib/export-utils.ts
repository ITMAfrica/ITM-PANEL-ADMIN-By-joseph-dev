/**
 * Export utilities for converting data to CSV, JSON, and clipboard formats.
 */

/**
 * Escapes a value for safe inclusion in a CSV cell.
 * Handles commas, double quotes, and newlines per RFC 4180.
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If the value contains a comma, double quote, or newline, wrap it in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Double up any existing double quotes
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts an array of objects to CSV format string.
 * @param data - Array of objects to convert
 * @param columns - Optional array of column headers (keys). If not provided, uses keys from the first object.
 */
export function objectsToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns?: string[]
): string {
  if (data.length === 0) return '';

  const headers = columns || Object.keys(data[0]);
  const headerRow = headers.map(escapeCSVValue).join(',');
  const rows = data.map((obj) =>
    headers
      .map((key) => escapeCSVValue(obj[key]))
      .join(',')
  );

  return [headerRow, ...rows].join('\n');
}

/**
 * Converts an array of objects to JSON format string.
 */
export function objectsToJSON<T extends Record<string, unknown>>(data: T[]): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Creates a Blob from CSV string data.
 */
export function createCSVBlob(csvString: string): Blob {
  return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Creates a Blob from JSON string data.
 */
export function createJSONBlob(jsonString: string): Blob {
  return new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
}

/**
 * Triggers a file download in the browser using URL.createObjectURL.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Clean up the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Exports data as a CSV file download.
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: string[]
): void {
  const csvString = objectsToCSV(data, columns);
  const blob = createCSVBlob(csvString);
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Exports data as a JSON file download.
 */
export function exportToJSON<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): void {
  const jsonString = objectsToJSON(data);
  const blob = createJSONBlob(jsonString);
  downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

/**
 * Copies data to the clipboard as formatted text.
 */
export async function copyToClipboard<T extends Record<string, unknown>>(
  data: T[],
  format: 'csv' | 'json' = 'csv',
  columns?: string[]
): Promise<boolean> {
  try {
    const text = format === 'json' ? objectsToJSON(data) : objectsToCSV(data, columns);
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats task data for export.
 */
export function formatTasksForExport(tasks: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return tasks.map((task) => ({
    Title: task.title ?? '',
    Status: task.status ?? '',
    Priority: task.priority ?? '',
    Assignee: task.assigneeName ?? task.assigneeId ?? '',
    'Due Date': task.dueDate ?? '',
    Project: task.projectName ?? task.projectId ?? '',
  }));
}

/**
 * Formats project data for export.
 */
export function formatProjectsForExport(projects: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return projects.map((project) => ({
    Name: project.name ?? '',
    Status: project.status ?? '',
    Progress: project.progress != null ? `${project.progress}%` : '',
    'Members Count': project.membersCount ?? (Array.isArray(project.members) ? project.members.length : 0),
    'Tasks Count': project.taskCount ?? 0,
  }));
}

/**
 * Formats workload data for export.
 */
export function formatWorkloadForExport(workload: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return workload.map((item) => ({
    Team: item.name ?? '',
    'Active Tasks': item.tasks ?? 0,
    'Completed Tasks': item.completed ?? 0,
  }));
}
