// toast-container.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="toast-stack" aria-live="polite" aria-atomic="true">
    @for (t of (toastSvc.toasts$ | async) ?? []; track t.id) {
      <div class="toast-card" [class]="t.variant">
        <div class="toast-header">
          <div class="title-wrap">
            <span class="icon"></span>
            <strong>{{ t.title }}</strong>
          </div>
          <button type="button" class="close" (click)="toastSvc.dismiss(t.id)">×</button>
        </div>
        <div class="toast-body">
          <p>{{ t.message }}</p>
          @if (t.actionLabel) {
            <button type="button" class="btn-action" (click)="t.onAction?.(); toastSvc.dismiss(t.id)">
              {{ t.actionLabel }}
            </button>
          }
        </div>
      </div>
    }
  </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed; right: 16px; top: 16px; z-index: 1080;
      display: flex; flex-direction: column; gap: 10px;
      pointer-events: none;
    }
    .toast-card {
      pointer-events: auto;
      min-width: 320px; max-width: 460px;
      padding: 12px 14px; border-radius: 14px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.18);
      background: linear-gradient(180deg, #ffffff, #fafafa);
      border-left: 5px solid; animation: dropIn .18s ease-out;
    }
    @keyframes dropIn { from { transform: translateY(-6px); opacity: .0 } to { transform: translateY(0); opacity: 1 } }

    .toast-card.info    { border-color: #31A5DD; }
    .toast-card.success { border-color: #31A5DD; }
    .toast-card.warning { border-color: #31A5DD; }
    .toast-card.error   { border-color: #31A5DD; }

    .toast-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
    .title-wrap { display:flex; align-items:center; gap:8px; }
    .icon { font-size: 18px; }

    .toast-header .close {
      background:none; border:none; font-size:18px; cursor:pointer; color:#6b7280;
    }
    .toast-body p { margin: 0 0 8px 0; color:#111827; }
    .btn-action {
      border: none; background: #31A5DD; color: #fff; padding: 7px 12px;
      border-radius: 8px; cursor: pointer; font-weight: 600;
    }
  `]
})
export class ToastContainerComponent {
  constructor(public toastSvc: ToastService) {}
}
