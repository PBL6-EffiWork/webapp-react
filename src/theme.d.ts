// src/theme.d.ts

import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    Effiwork: {
      appBarHeight: string;
      boardBarHeight: string;
      boardContentHeight: string;
      columnHeaderHeight: string;
      columnFooterHeight: string;
    };
  }

  interface ThemeOptions {
    Effiwork?: {
      appBarHeight?: string;
      boardBarHeight?: string;
      boardContentHeight?: string;
      columnHeaderHeight?: string;
      columnFooterHeight?: string;
    };
  }
}

export {};
