import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Filter, Sort, Ticket } from '../../data-access/ticket.model';

@Component({
  selector: 'app-filter-sort',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-sort.component.html',
  styleUrls: ['./filter-sort.component.css'],
})
export class FilterSortComponent {
  filter = input<Filter>({
    status: 'all',
    searchTerm: '',
  });

  sort = input<Sort>({
    field: 'title',
    direction: 'asc',
  });

  filterChange = output<Filter>();
  sortChange = output<Sort>();

  onSearchChange(searchTerm: string) {
    this.filterChange.emit({
      ...this.filter(),
      searchTerm,
    });
  }

  onStatusChange(status: Filter['status']) {
    this.filterChange.emit({
      ...this.filter(),
      status,
    });
  }

  onSortFieldChange(field: Sort['field']) {
    this.sortChange.emit({
      ...this.sort(),
      field,
    });
  }

  onSortDirectionChange() {
    this.sortChange.emit({
      ...this.sort(),
      direction: this.sort().direction === 'asc' ? 'desc' : 'asc',
    });
  }
}
