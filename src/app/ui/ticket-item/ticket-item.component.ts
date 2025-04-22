import { Component, input, output } from '@angular/core';
import { Ticket } from '../../data-access/ticket.model';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ticket-item',
  standalone: true,
  imports: [DatePipe, NgClass, TitleCasePipe, RouterModule],
  templateUrl: './ticket-item.component.html',
  styleUrls: ['./ticket-item.component.css'],
})
export class TicketItemComponent {
  ticket = input.required<Ticket>();

  edit = output<Ticket>();
  delete = output<Ticket>();
  statusChange = output<{
    ticket: Ticket;
    status: Ticket['status'];
  }>();
}
