import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Ticket,
  CreateTicketDto,
  UpdateTicketDto,
} from '../../data-access/ticket.model';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.css'],
})
export class TicketFormComponent {
  @Input() ticket: Ticket | null = null;
  @Output() create = new EventEmitter<CreateTicketDto>();
  @Output() update = new EventEmitter<UpdateTicketDto>();
  @Output() cancel = new EventEmitter<void>();

  ticketForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.ticketForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['open', Validators.required],
    });
  }

  hasError(field: string): boolean {
    const control = this.ticketForm.get(field);
    return Boolean(
      control && control.invalid && (control.dirty || control.touched)
    );
  }

  onSubmit(): void {
    // complete
  }

  onCancel(): void {
    // complete
  }
}
