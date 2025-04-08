import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TicketStore } from '../../data-access/ticket.state';
import { Ticket, CreateTicketDto } from '../../data-access/ticket.model';
import { TicketItemComponent } from '../../ui/ticket-item/ticket-item.component';
import { TicketFormComponent } from '../../ui/ticket-form/ticket-form.component';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../ui/error-state/error-state.component';
import { FilterSortComponent } from '../../ui/filter-sort/filter-sort.component';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    TicketItemComponent,
    TicketFormComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    FilterSortComponent,
  ],
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css'],
})
export default class TicketListComponent implements OnInit {
  ticketStore = inject(TicketStore);
  router = inject(Router);

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.ticketStore.loadTickets();
  }

  createTicket(ticket: CreateTicketDto) {
    this.ticketStore.createTicket(ticket);
  }

  navigateToDetail(id: number) {
    this.router.navigate(['tickets', id]);
  }

  deleteTicket(id: number) {
    if (confirm('Are you sure you want to delete this ticket?')) {
      this.ticketStore.deleteTicket(id);
    }
  }

  updateTicketStatus(ticket: Ticket, status: Ticket['status']) {
    this.ticketStore.updateTicket(ticket.id, { status });
  }

  resetFilters() {
    this.ticketStore.setFilter({
      status: 'all',
      searchTerm: '',
    });
  }
}
