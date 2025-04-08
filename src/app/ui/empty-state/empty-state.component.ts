import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css'],
})
export class EmptyStateComponent {
  @Input() title = 'No items found';
  @Input() message = 'There are no items to display at this time.';
}
