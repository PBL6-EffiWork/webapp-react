// src/theme.d.ts

import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    trello: {
      appBarHeight: string;
      boardBarHeight: string;
      boardContentHeight: string;
      columnHeaderHeight: string;
      columnFooterHeight: string;
    };
  }

  interface ThemeOptions {
    trello?: {
      appBarHeight?: string;
      boardBarHeight?: string;
      boardContentHeight?: string;
      columnHeaderHeight?: string;
      columnFooterHeight?: string;
    };
  }
}

export {};
