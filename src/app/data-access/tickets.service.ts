import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, catchError, throwError } from 'rxjs';
import {
  Ticket,
  CreateTicketDto,
  UpdateTicketDto,
  Filter,
  Sort,
} from './ticket.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';

type TicketsState = {
  tickets: Ticket[];
  loaded: boolean;
  error: string | null;
  filter: Filter;
  sort: Sort;
};

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // State (signal)
  private state = signal<TicketsState>({
    tickets: [],
    loaded: false,
    error: null,
    filter: { status: 'all', searchTerm: '' },
    sort: { field: 'createdAt', direction: 'asc' },
  });

  // Sources
  //  -> Observable
  private tickets$ = this.getTickets();
  // -> Subject
  changeStatus$ = new Subject<{ ticket: Ticket; status: Ticket['status'] }>();
  deleteTicket$ = new Subject<Ticket>();
  filterChange$ = new Subject<Filter>();
  sortChange$ = new Subject<Sort>();
  createTicket$ = new Subject<CreateTicketDto>();
  updateTicket$ = new Subject<{ id: number; dto: UpdateTicketDto }>();

  // Selectors (signals)
  tickets = computed(() => {
    let tickets = this.state().tickets;
    const { status, searchTerm } = this.state().filter;
    const { field, direction } = this.state().sort;
    // Filter
    if (status !== 'all') {
      tickets = tickets.filter((t) => t.status === status);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.description.toLowerCase().includes(term)
      );
    }
    // Sort
    tickets = [...tickets].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      // Handle Date fields
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }
      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return tickets;
  });

  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);
  filter = computed(() => this.state().filter);
  sort = computed(() => this.state().sort);

  constructor() {
    // Reducers -> Escuchar un Source y actualizar el State
    this.tickets$.pipe(takeUntilDestroyed()).subscribe({
      next: (tickets) => {
        this.state.update((prev) => ({
          ...prev,
          tickets,
          loaded: true,
        }));
      },
      error: (error) => {
        this.state.update((prev) => ({
          ...prev,
          loaded: true,
          error: error.message,
        }));
      },
    });

    this.changeStatus$
      .pipe(takeUntilDestroyed())
      .subscribe(({ ticket, status }) => {
        const updatedTicket = { ...ticket, status };

        this.updateTicket(ticket.id, updatedTicket).subscribe({
          next: (updated) => {
            this.state.update((prev) => ({
              ...prev,
              tickets: prev.tickets.map((t) =>
                t.id === updated.id ? updated : t
              ),
            }));
          },
          error: (error) => {
            // console.error('Error updating ticket status', error);
          },
        });
      });

    this.deleteTicket$.pipe(takeUntilDestroyed()).subscribe((ticket) => {
      this.deleteTicket(ticket.id).subscribe({
        next: () => {
          this.state.update((prev) => ({
            ...prev,
            tickets: prev.tickets.filter((t) => t.id !== ticket.id),
          }));
        },
        error: (error) => {
          this.state.update((prev) => ({
            ...prev,
            error: error.message,
          }));
        },
      });
    });

    this.filterChange$.pipe(takeUntilDestroyed()).subscribe((filter) => {
      this.state.update((prev) => ({ ...prev, filter }));
    });

    this.sortChange$.pipe(takeUntilDestroyed()).subscribe((sort) => {
      this.state.update((prev) => ({ ...prev, sort }));
    });

    this.createTicket$.pipe(takeUntilDestroyed()).subscribe((ticketDto) => {
      this.createTicket(ticketDto).subscribe({
        next: (created) => {
          this.state.update((prev) => ({
            ...prev,
            tickets: [...prev.tickets, created],
          }));
        },
        error: (error) => {
          this.state.update((prev) => ({
            ...prev,
            error: error.message,
          }));
        },
      });
    });

    this.updateTicket$.pipe(takeUntilDestroyed()).subscribe(({ id, dto }) => {
      this.updateTicket(id, dto).subscribe({
        next: (updated) => {
          this.state.update((prev) => ({
            ...prev,
            tickets: prev.tickets.map((t) =>
              t.id === updated.id ? updated : t
            ),
          }));
        },
        error: (error) => {
          // console.error('Error updating ticket', error);
        },
      });
    });
  }

  private getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl).pipe(
      catchError((error) => {
        // console.error('Error fetching tickets', error);
        return throwError(() => new Error('Failed to fetch tickets'));
      })
    );
  }

  private createTicket(ticket: CreateTicketDto): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket).pipe(
      catchError((error) => {
        // console.error('Error creating ticket', error);
        return throwError(() => new Error('Failed to create ticket'));
      })
    );
  }

  private updateTicket(
    id: number,
    ticket: UpdateTicketDto
  ): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket).pipe(
      catchError((error) => {
        // console.error(`Error updating ticket ${id}`, error);
        return throwError(() => new Error('Failed to update ticket'));
      })
    );
  }

  private deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        // console.error(`Error deleting ticket ${id}`, error);
        return throwError(() => new Error('Failed to delete ticket'));
      })
    );
  }
}
