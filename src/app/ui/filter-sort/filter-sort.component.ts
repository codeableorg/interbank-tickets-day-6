import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ticket } from '../../data-access/ticket.model';

@Component({
  selector: 'app-filter-sort',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-sort.component.html',
  styleUrls: ['./filter-sort.component.css'],
})
export class FilterSortComponent {
  @Input() filter = {
    status: 'all',
    searchTerm: '',
  };
  @Input() sort = {
    field: 'title',
    direction: 'asc',
  };

  @Output() filterChange = new EventEmitter();
  @Output() sortChange = new EventEmitter();

  onSearchChange(searchTerm: string) {
    // ...
  }

  onStatusChange(status: string) {
    // ...
  }

  onSortFieldChange(field: keyof Ticket) {
    // ...
  }

  onSortDirectionChange() {
    // ...
  }
}
