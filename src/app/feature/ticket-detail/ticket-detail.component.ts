import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketStore } from '../../data-access/ticket.state';
import { UpdateTicketDto } from '../../data-access/ticket.model';
import { TicketFormComponent } from '../../ui/ticket-form/ticket-form.component';
import { EmptyStateComponent } from '../../ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../ui/error-state/error-state.component';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [TicketFormComponent, EmptyStateComponent, ErrorStateComponent],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css'],
})
export default class TicketDetailComponent implements OnInit {
  ticketStore = inject(TicketStore);
  route = inject(ActivatedRoute);
  router = inject(Router);
  ticketId!: number;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.ticketId = +id;
        this.loadTicket();
      }
    });
  }

  loadTicket(): void {
    this.ticketStore.loadTicket(this.ticketId);
  }

  updateTicket(ticket: UpdateTicketDto): void {
    this.ticketStore.updateTicket(this.ticketId, ticket);
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/tickets']);
  }
}
