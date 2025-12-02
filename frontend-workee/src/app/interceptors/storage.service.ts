// storage.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly isBrowser = typeof window !== 'undefined';

  // LocalStorage (persistente)
  setItem(key: string, value: string): void {
    if (this.isBrowser) localStorage.setItem(key, value);
  }
  getItem(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }
  removeItem(key: string): void {
    if (this.isBrowser) localStorage.removeItem(key);
  }

  // SessionStorage (si lo necesitás)
  setSessionItem(key: string, value: string): void {
    if (this.isBrowser) sessionStorage.setItem(key, value);
  }
  getSessionItem(key: string): string | null {
    return this.isBrowser ? sessionStorage.getItem(key) : null;
  }
  removeSessionItem(key: string): void {
    if (this.isBrowser) sessionStorage.removeItem(key);
  }

  // Limpiar todo (sin romper SSR)
  clearAll(): void {
    if (!this.isBrowser) return;
    localStorage.clear();
    sessionStorage.clear();
  }
}
