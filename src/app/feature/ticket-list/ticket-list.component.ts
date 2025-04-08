import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TicketItemComponent } from '../../ui/ticket-item/ticket-item.component';
import { TicketFormComponent } from '../../ui/ticket-form/ticket-form.component';
import { FilterSortComponent } from '../../ui/filter-sort/filter-sort.component';
import { Ticket } from '../../data-access/ticket.model';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [TicketItemComponent, TicketFormComponent, FilterSortComponent],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css'],
})
export default class TicketListComponent {
  router = inject(Router);

  ticket: Ticket = {
    id: 0,
    title: 'Demo Ticket',
    description: 'This is a demo ticket description.',
    status: 'open',
    createdAt: new Date(),
  };
}
