'use client';

// 用户配置持久化 hook — localStorage + API 双写
// 与旧 IMS 的 usePersistedConfig 接口兼容
import { useState, useEffect, useCallback } from 'react';

interface PersistedConfig<T> {
  config: T;
  toggle: (key: string) => void;
  reorder: (from: number, to: number) => void;
  moveToTop: (key: string) => void;
  reset: () => void;
  ready: boolean;
}

export function usePersistedConfig<T extends { key: string; visible: boolean }[]>(
  configKey: string,
  defaults: T
): PersistedConfig<T> {
  const [config, setConfig] = useState<T>(defaults);
  const [ready, setReady] = useState(false);

  // 初始化加载
  useEffect(() => {
    async function load() {
      try {
        // 尝试从 API 加载
        const res = await fetch(`/api/column-configs?key=${configKey}`);
        const data = await res.json();
        if (data.success && data.data) {
          setConfig(data.data as T);
          setReady(true);
          return;
        }
      } catch { /* ignore */ }

      // 降级：从 localStorage 加载
      try {
        const stored = localStorage.getItem(`ims_${configKey}`);
        if (stored) {
          const parsed = JSON.parse(stored) as T;
          // 缓存检测：如果缓存的 key 数量与默认值不同（说明配置结构变了），用默认值
          if (Array.isArray(parsed) && Array.isArray(defaults) && parsed.length !== defaults.length) {
            localStorage.removeItem(`ims_${configKey}`);
          } else {
            setConfig(parsed);
          }
        }
      } catch { /* ignore */ }

      setReady(true);
    }
    load();
  }, [configKey]);

  // 同步保存
  const save = useCallback(
    (newConfig: T) => {
      setConfig(newConfig);
      // localStorage 同步写入
      try {
        localStorage.setItem(`ims_${configKey}`, JSON.stringify(newConfig));
      } catch { /* ignore */ }
      // API 异步写入
      fetch('/api/column-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configKey, configData: newConfig }),
      }).catch(() => { /* ignore */ });
    },
    [configKey]
  );

  const toggle = useCallback(
    (key: string) => {
      const newConfig = config.map((item) =>
        item.key === key ? { ...item, visible: !item.visible } : item
      ) as T;
      save(newConfig);
    },
    [config, save]
  );

  const reorder = useCallback(
    (from: number, to: number) => {
      const newConfig = [...config] as T;
      const [removed] = newConfig.splice(from, 1);
      newConfig.splice(to, 0, removed);
      save(newConfig);
    },
    [config, save]
  );

  const moveToTop = useCallback(
    (key: string) => {
      const idx = config.findIndex((item) => item.key === key);
      if (idx <= 0) return;
      reorder(idx, 0);
    },
    [config, reorder]
  );

  const reset = useCallback(() => {
    save(defaults);
  }, [defaults, save]);

  return { config, toggle, reorder, moveToTop, reset, ready };
}
