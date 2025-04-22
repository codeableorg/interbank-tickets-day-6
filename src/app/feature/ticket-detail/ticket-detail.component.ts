import { Component, OnDestroy, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TicketFormComponent } from '../../ui/ticket-form/ticket-form.component';
import { TicketsService } from '../../data-access/tickets.service';
import { UpdateTicketDto } from '../../data-access/ticket.model';
import { CurrentTicketService } from '../../data-access/current-ticket.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [TicketFormComponent, RouterLink],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css'],
})
export default class TicketDetailComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  ticketsService = inject(TicketsService);
  currentTicketService = inject(CurrentTicketService);
  private ticketId = Number(this.route.snapshot.paramMap.get('id'));

  ngOnInit(): void {
    this.currentTicketService.fetchTicketById$.next(this.ticketId);
  }

  onUpdate(dto: UpdateTicketDto) {
    this.ticketsService.updateTicket$.next({ id: this.ticketId, dto });
    this.router.navigate(['/tickets']);
  }

  ngOnDestroy(): void {
    this.currentTicketService.clearCurrentTicket$.next();
  }
}
