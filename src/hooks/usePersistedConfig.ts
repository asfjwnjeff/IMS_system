import { useState, useCallback } from 'react';

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded, silently ignore */ }
}

export interface FieldConfig {
  key: string;
  visible: boolean;
  order: number;
}

export function usePersistedConfig(key: string, defaultFields: FieldConfig[]) {
  const [fields, setFields] = useState<FieldConfig[]>(() => {
    const saved = loadJson<FieldConfig[] | null>(key, null);
    if (saved && saved.length > 0) return saved;
    return defaultFields;
  });

  const persist = useCallback(
    (next: FieldConfig[]) => {
      setFields(next);
      saveJson(key, next);
    },
    [key],
  );

  const toggle = useCallback(
    (fieldKey: string) => {
      const next = fields.map((f) => (f.key === fieldKey ? { ...f, visible: !f.visible } : f));
      persist(next);
    },
    [fields, persist],
  );

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const next = [...fields];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      const reordered = next.map((f, i) => ({ ...f, order: i }));
      persist(reordered);
    },
    [fields, persist],
  );

  const reset = useCallback(() => {
    persist(defaultFields);
  }, [persist, defaultFields]);

  const visibleFields = fields
    .filter((f) => f.visible)
    .sort((a, b) => a.order - b.order);

  const hiddenFields = fields
    .filter((f) => !f.visible)
    .sort((a, b) => a.order - b.order);

  return { fields, visibleFields, hiddenFields, toggle, reorder, reset, setFields: persist };
}
