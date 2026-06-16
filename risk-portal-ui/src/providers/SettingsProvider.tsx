/* eslint-disable no-unused-vars */
import { createContext, type PropsWithChildren, useContext, useState } from 'react';

import { defaultSettings, ISettings, type SettingsModeType } from '@/config/settings.config';

import { getData, setData } from '@/utils';

export interface ISettingsProps {
  settings: ISettings;
  storeSettings: (settings: Partial<ISettings>) => void;
  updateSettings: (settings: Partial<ISettings>) => void;
  getMode: () => SettingsModeType;
}

const SETTINGS_CONFIGS_KEY = 'settings-configs';

const getStoredSettings = (): Partial<ISettings> => {
  return (getData(SETTINGS_CONFIGS_KEY) as Partial<ISettings>) || {};
};

const initialProps: ISettingsProps = {
  settings: { ...defaultSettings, ...getStoredSettings() },
  updateSettings: (settings: Partial<ISettings>) => {},
  storeSettings: (settings: Partial<ISettings>) => {},
  getMode: () => 'light'
};

const LayoutsContext = createContext<ISettingsProps>(initialProps);
const useSettings = () => useContext(LayoutsContext);

const SettingsProvider = ({ children }: PropsWithChildren) => {
  const [settings, setSettings] = useState(initialProps.settings);

  const updateSettings = (newSettings: Partial<ISettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const storeSettings = (newSettings: Partial<ISettings>) => {
    setData(SETTINGS_CONFIGS_KEY, { ...getStoredSettings(), ...newSettings });
    updateSettings(newSettings);
  };

  const getMode = (): SettingsModeType => {
    const { mode } = settings;

    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else if (mode === 'dark') {
      return 'dark';
    } else {
      return 'light';
    }
  };

  return (
    <LayoutsContext.Provider value={{ settings, updateSettings, storeSettings, getMode }}>
      {children}
    </LayoutsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { SettingsProvider, useSettings };
