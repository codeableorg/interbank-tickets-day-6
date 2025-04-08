import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
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
export class TicketFormComponent implements OnChanges {
  @Input() ticket: Ticket | null = null;
  @Output() create = new EventEmitter<CreateTicketDto>();
  @Output() update = new EventEmitter<UpdateTicketDto>();
  @Output() cancel = new EventEmitter<void>();

  ticketForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.ticketForm = this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ticket'] && this.ticket) {
      this.ticketForm.patchValue({
        title: this.ticket.title,
        description: this.ticket.description,
        status: this.ticket.status,
      });
    } else if (changes['ticket'] && !this.ticket) {
      this.ticketForm.reset({
        title: '',
        description: '',
        status: 'open',
      });
    }
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
    if (this.ticketForm.invalid) return;

    const formData = this.ticketForm.value;

    if (this.ticket) {
      this.update.emit(formData);
    } else {
      this.create.emit(formData);
      this.ticketForm.reset({
        title: '',
        description: '',
        status: 'open',
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
