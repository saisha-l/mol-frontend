/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Minimal type declarations for 3Dmol.js loaded via CDN.
 * For full types, see: https://github.com/nicvac-classes/3dmol-types
 */

declare namespace $3Dmol {
    interface GLViewer {
      addModel(data: string, format: string): any;
      setStyle(sel: any, style: any): void;
      zoomTo(sel?: any): void;
      zoom(factor: number): void;
      render(): void;
      resize(): void;
      clear(): void;
      removeAllModels(): void;
      setBackgroundColor(color: string): void;
      spin(axis?: string | boolean): void;
    }
  
    function createViewer(
      element: HTMLElement | null,
      config?: Record<string, any>
    ): GLViewer;
  }