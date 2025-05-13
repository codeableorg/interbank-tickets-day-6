import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, catchError, throwError, switchMap } from 'rxjs';
import { Ticket } from './ticket.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';

type CurrentTicketState = {
  currentTicket: Ticket | null;
  loading: boolean;
  error: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class CurrentTicketService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // State
  private state = signal<CurrentTicketState>({
    currentTicket: null,
    loading: false,
    error: null,
  });

  // Selectors
  currentTicket = computed(() => this.state().currentTicket);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);

  // Sources
  fetchTicketById$ = new Subject<number>();
  clearCurrentTicket$ = new Subject<void>();

  constructor() {
    // Reducers

    this.fetchTicketById$
      .pipe(
        switchMap((id) => this.getTicket(id)),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (ticket) => {
          this.state.update((prev) => ({
            ...prev,
            currentTicket: ticket,
            loading: false,
            error: null,
          }));
        },
        error: (error) => {
          this.state.update((prev) => ({
            ...prev,
            currentTicket: null,
            loading: false,
            error: error.message || 'Failed to fetch ticket details', // Use error message
          }));
        },
      });

    this.clearCurrentTicket$.pipe(takeUntilDestroyed()).subscribe(() => {
      this.state.update((prev) => ({
        ...prev,
        currentTicket: null,
        loading: false,
        error: null,
      }));
    });
  }

  private getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error fetching ticket ${id}`, error);
        return throwError(() => new Error(`Failed to fetch ticket ${id}`));
      })
    );
  }
}
