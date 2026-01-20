import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() showCloseButton: boolean = true;
  @Input() closeOnBackdropClick: boolean = true;
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    // Prevenir scroll do body quando modal está aberta
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    // Restaurar scroll do body
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: Event): void {
    if (event instanceof KeyboardEvent && event.key === 'Escape') {
      this.handleClose();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdropClick && (event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.handleClose();
    }
  }

  handleClose(): void {
    this.close.emit();
  }
}

