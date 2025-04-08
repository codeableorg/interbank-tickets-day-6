import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { Ticket, CreateTicketDto, UpdateTicketDto } from './ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/tickets';

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching tickets', error);
        return throwError(() => new Error('Failed to fetch tickets'));
      })
    );
  }

  getTicket(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error fetching ticket ${id}`, error);
        return throwError(() => new Error('Failed to fetch ticket details'));
      })
    );
  }

  createTicket(ticket: CreateTicketDto): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, ticket).pipe(
      catchError((error) => {
        console.error('Error creating ticket', error);
        return throwError(() => new Error('Failed to create ticket'));
      })
    );
  }

  updateTicket(id: number, ticket: UpdateTicketDto): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket).pipe(
      catchError((error) => {
        console.error(`Error updating ticket ${id}`, error);
        return throwError(() => new Error('Failed to update ticket'));
      })
    );
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Error deleting ticket ${id}`, error);
        return throwError(() => new Error('Failed to delete ticket'));
      })
    );
  }
}
