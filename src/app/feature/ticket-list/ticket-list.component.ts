import { Component, inject } from '@angular/core';
import { TicketItemComponent } from '../../ui/ticket-item/ticket-item.component';
import { TicketFormComponent } from '../../ui/ticket-form/ticket-form.component';
import { FilterSortComponent } from '../../ui/filter-sort/filter-sort.component';
import { TicketsService } from '../../data-access/tickets.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [TicketItemComponent, TicketFormComponent, FilterSortComponent],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css'],
})
export default class TicketListComponent {
  ticketService = inject(TicketsService);
}
