import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketFormComponent } from '../../ui/ticket-form/ticket-form.component';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [TicketFormComponent],
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.css'],
})
export default class TicketDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  ticketId!: number;
}
