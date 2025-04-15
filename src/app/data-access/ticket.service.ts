import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, catchError, of, throwError } from 'rxjs';
import { Ticket, CreateTicketDto, UpdateTicketDto } from './ticket.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type TicketsState = {
  tickets: Ticket[];
  loaded: boolean;
  error: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/tickets';

  // State (signal)
  private state = signal<TicketsState>({
    tickets: [],
    loaded: false,
    error: null,
  });

  // Sources
  //  -> Observable
  private tickets$ = this.getTickets();
  // -> Subject
  changeStatus$ = new Subject<{ ticket: Ticket; status: Ticket['status'] }>();

  // Selectors (signals)
  tickets = computed(() => this.state().tickets);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);

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
                t.id === updated.id ? updated : t,
              ),
            }));
          },
          error: (error) => {
            console.error('Error updating ticket status', error);
          },
        });
      });
  }

  private getTickets(): Observable<Ticket[]> {
    return this.http
      .get<Ticket[]>(this.apiUrl + '?delay=1000&error=false')
      .pipe(
        catchError((error) => {
          console.error('Error fetching tickets', error);
          return throwError(() => new Error('Failed to fetch tickets'));
        }),
      );
  }

  private getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error fetching ticket ${id}`, error);
        return throwError(() => new Error('Failed to fetch ticket details'));
      }),
    );
  }

  private createTicket(ticket: CreateTicketDto): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket).pipe(
      catchError((error) => {
        console.error('Error creating ticket', error);
        return throwError(() => new Error('Failed to create ticket'));
      }),
    );
  }

  private updateTicket(
    id: number,
    ticket: UpdateTicketDto,
  ): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket).pipe(
      catchError((error) => {
        console.error(`Error updating ticket ${id}`, error);
        return throwError(() => new Error('Failed to update ticket'));
      }),
    );
  }

  private deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error deleting ticket ${id}`, error);
        return throwError(() => new Error('Failed to delete ticket'));
      }),
    );
  }
}
