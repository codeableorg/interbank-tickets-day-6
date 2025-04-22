import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TicketFormComponent } from '../../ui/ticket-form/ticket-form.component';
import { TicketsService } from '../../data-access/tickets.service';
import { UpdateTicketDto } from '../../data-access/ticket.model';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [TicketFormComponent, RouterLink],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css'],
})
export default class TicketDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  ticketService = inject(TicketsService);
  private ticketId: number = +this.route.snapshot.paramMap.get('id')!;

  constructor() {
    this.ticketService.fetchTicketById(this.ticketId);
  }

  onUpdate(dto: UpdateTicketDto) {
    this.ticketService.updateTicket$.next({ id: this.ticketId!, dto });
    this.router.navigate(['/tickets']);
  }
}
