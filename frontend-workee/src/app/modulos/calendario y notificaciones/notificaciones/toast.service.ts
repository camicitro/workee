// toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export interface AppToast {
  id: number;
  title: string;
  message: string;
  variant: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  timeoutMs?: number; // default 6000
  key?: string;       // 🔹 NUEVO: clave lógica para reemplazo
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = new BehaviorSubject<AppToast[]>([]);
  toasts$ = this._toasts.asObservable();
  private _id = 1;

  show(t: Omit<AppToast, 'id'>) {
    const timeout = t.timeoutMs ?? 0;
    const toast: AppToast = { ...t, id: this._id++ };

    // 🔹 si tiene key, reemplazo el existente con esa key
    if (t.key) {
      const others = this._toasts.value.filter(x => x.key !== t.key);
      this._toasts.next([...others, toast]);
    } else {
      this._toasts.next([...this._toasts.value, toast]);
    }

    if (toast.timeoutMs && toast.timeoutMs > 0) {
      const id = toast.id;
      setTimeout(() => this.dismiss(id), toast.timeoutMs);
    }
    return toast.id;
  }

  // 🔹 helper opcional (azúcar sintáctico)
  showUnique(key: string, t: Omit<AppToast, 'id' | 'key'>) {
    return this.show({ ...t, key });
  }

  dismiss(id: number) {
    this._toasts.next(this._toasts.value.filter(t => t.id !== id));
  }

  clear() {
    this._toasts.next([]);
  }
}
