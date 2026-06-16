import { type KeenIconsStyleType } from '../components/keenicons/types';

export type SettingsModeType = 'light' | 'dark' | 'system';

export type SettingsContainerType = 'default' | 'fluid' | 'fixed';

export type PathsType = Record<string, string>;

export interface ISettings {
  mode: SettingsModeType;
  container: SettingsContainerType;
  keeniconsStyle: KeenIconsStyleType;
}

// Default settings for the application
const defaultSettings: ISettings = {
  mode: 'light', // Default to light mode for the application
  keeniconsStyle: 'filled', // Default to using filled KeenIcons style
  container: 'fixed', // Default container layout is set to fixed
};

export { defaultSettings };
