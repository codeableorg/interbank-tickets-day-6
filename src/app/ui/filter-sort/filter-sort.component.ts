import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ticket, TicketState } from '../../data-access/ticket.model';

@Component({
  selector: 'app-filter-sort',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-sort.component.html',
  styleUrls: ['./filter-sort.component.css'],
})
export class FilterSortComponent {
  @Input() filter!: TicketState['filter'];
  @Input() sort!: TicketState['sort'];

  @Output() filterChange = new EventEmitter<Partial<TicketState['filter']>>();
  @Output() sortChange = new EventEmitter<Partial<TicketState['sort']>>();

  onSearchChange(searchTerm: string) {
    this.filterChange.emit({ searchTerm });
  }

  onStatusChange(status: TicketState['filter']['status']) {
    this.filterChange.emit({ status });
  }

  onSortFieldChange(field: keyof Ticket) {
    this.sortChange.emit({ field });
  }

  onSortDirectionChange() {
    const newDirection = this.sort.direction === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ direction: newDirection });
  }
}
