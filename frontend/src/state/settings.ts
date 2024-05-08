import { atom } from 'recoil';

type ThemeVariant = 'dark' | 'light';

const defaultTheme = 'light';

const preferredTheme = localStorage.getItem(
  'themeVariant'
) as ThemeVariant | null;

const serverDefaultTheme = localStorage.getItem('serverDefaultTheme') as ThemeVariant | null;

// Use the server default theme if it exists, otherwise use the user's preferred theme or the default theme
const theme = serverDefaultTheme ? serverDefaultTheme : (preferredTheme ? preferredTheme : defaultTheme);

export const defaultSettingsState = {
  open: false,
  defaultCollapseContent: true,
  expandAll: false,
  hideCot: false,
  isChatHistoryOpen: true,
  language: 'en-US',
  theme
};

export const settingsState = atom<{
  open: boolean;
  defaultCollapseContent: boolean;
  expandAll: boolean;
  hideCot: boolean;
  theme: ThemeVariant;
  isChatHistoryOpen: boolean;
  language: string;
}>({
  key: 'AppSettings',
  default: defaultSettingsState
});
