declare module 'qrious' {
    interface QRiousOptions {
      background?: string;
      backgroundAlpha?: number;
      foreground?: string;
      foregroundAlpha?: number;
      level?: 'L' | 'M' | 'Q' | 'H';
      mime?: string;
      padding?: number;
      size?: number;
      value?: string;
    }
  
    class QRious {
      canvas: HTMLCanvasElement; // Add this line
      constructor(options?: QRiousOptions & { element?: HTMLElement });
      constructor(element: HTMLElement, options?: QRiousOptions);
      toDataURL(mime?: string): string;
      toDataURL(mime: string, quality: number): string;
      set(options: QRiousOptions): void;
    }
  
    export = QRious;
  }