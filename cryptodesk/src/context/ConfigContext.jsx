import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ConfigContext = createContext(null);

const STORAGE = {
  soso: 'cd_soso',
  grok: 'cd_grok',
  sodex: 'cd_sodex',
  topic: 'cd_topic',
  dark: 'cd_dark',
};

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(() => ({
    sosoKey: sessionStorage.getItem(STORAGE.soso) || '',
    grokKey: sessionStorage.getItem(STORAGE.grok) || '',
    sodexKey: sessionStorage.getItem(STORAGE.sodex) || '',
    topic: sessionStorage.getItem(STORAGE.topic) || '',
    darkMode: sessionStorage.getItem(STORAGE.dark) !== 'false',
  }));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.body.classList.add('dark');
  }, []);

  const showToast = (msg, ms = 3500) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  const saveConfig = (next) => {
    setConfig(next);
    sessionStorage.setItem(STORAGE.soso, next.sosoKey);
    sessionStorage.setItem(STORAGE.grok, next.grokKey);
    sessionStorage.setItem(STORAGE.sodex, next.sodexKey);
    sessionStorage.setItem(STORAGE.topic, next.topic);
    sessionStorage.setItem(STORAGE.dark, String(next.darkMode));
    setSettingsOpen(false);
    showToast('Connected — loading live data…');
  };

  const value = useMemo(
    () => ({
      config,
      saveConfig,
      settingsOpen,
      setSettingsOpen,
      toast,
      showToast,
      hasSoso: Boolean(config.sosoKey),
      hasGrok: Boolean(config.grokKey),
    }),
    [config, settingsOpen, toast]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
