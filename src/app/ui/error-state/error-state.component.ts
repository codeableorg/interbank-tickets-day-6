import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
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
