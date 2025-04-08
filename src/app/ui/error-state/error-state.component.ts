import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [NgIf],
  templateUrl: './error-state.component.html',
  styleUrls: ['./error-state.component.css'],
})
export class ErrorStateComponent {
  @Input() title = 'An error occurred';
  @Input() message = 'Something went wrong. Please try again later.';
  @Input() showRetry = true;
  @Input() showDismiss = true;
  @Output() retry = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();
}
