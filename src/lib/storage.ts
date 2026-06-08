const AUTH_KEY = "ptmd_auth";
const PROJECTS_KEY = "ptmd_projects";
const TASKS_KEY = "ptmd_tasks";

export type StoredAuth = {
  token: string;
  user: unknown;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

export function readStorageJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorageJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorageItem(key: string) {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(key);
}

export const authStorage = {
  read: () => readStorageJson<StoredAuth | null>(AUTH_KEY, null),
  write: (value: StoredAuth) => writeStorageJson(AUTH_KEY, value),
  clear: () => removeStorageItem(AUTH_KEY),
};

export const projectStorage = {
  read: <T>(fallback: T) => readStorageJson<T>(PROJECTS_KEY, fallback),
  write: (value: unknown) => writeStorageJson(PROJECTS_KEY, value),
};

export const taskStorage = {
  read: <T>(fallback: T) => readStorageJson<T>(TASKS_KEY, fallback),
  write: (value: unknown) => writeStorageJson(TASKS_KEY, value),
};
