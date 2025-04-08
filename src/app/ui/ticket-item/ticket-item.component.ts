import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Ticket } from '../../data-access/ticket.model';
import { DatePipe, NgClass, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-ticket-item',
  standalone: true,
  imports: [DatePipe, NgClass, TitleCasePipe],
  templateUrl: './ticket-item.component.html',
  styleUrls: ['./ticket-item.component.css'],
})
export class TicketItemComponent {
  @Input() ticket!: Ticket;
  @Output() edit = new EventEmitter<Ticket>();
  @Output() delete = new EventEmitter<Ticket>();
  @Output() statusChange = new EventEmitter<{
    ticket: Ticket;
    status: Ticket['status'];
  }>();
}
