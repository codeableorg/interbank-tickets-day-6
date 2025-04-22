import { Component, effect, inject, input, output } from '@angular/core';
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
  private fb = inject(FormBuilder);

  ticket = input<Ticket | null>(null);
  create = output<CreateTicketDto>();
  update = output<UpdateTicketDto>();
  cancel = output<void>();

  // Initialize form with default structure/validators
  ticketForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    status: ['open', Validators.required],
  });

  constructor() {
    // Use effect to react to ticket input changes and patch the form
    effect(() => {
      const currentTicket = this.ticket(); // Get the current signal value
      if (currentTicket) {
        // Patch the form when ticket data is available
        this.ticketForm.patchValue({
          title: currentTicket.title,
          description: currentTicket.description,
          status: currentTicket.status,
        });
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.ticketForm.get(field);
    return Boolean(
      control && control.invalid && (control.dirty || control.touched)
    );
  }

  onSubmit(): void {
    if (this.ticket()) {
      // Edit mode
      this.update.emit(this.ticketForm.value);
    } else {
      // Create mode
      this.create.emit(this.ticketForm.value);
      this.ticketForm.reset({ title: '', description: '', status: 'open' });
    }
  }

  onCancel(): void {
    this.cancel.emit();
    this.ticketForm.reset({ title: '', description: '', status: 'open' });
  }
}
