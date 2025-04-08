import { Injectable, computed, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import {
  Ticket,
  TicketState,
  CreateTicketDto,
  UpdateTicketDto,
} from './ticket.model';
import { TicketService } from './ticket.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class TicketStore {
  private ticketService = inject(TicketService);

  // state
  private state = signal<TicketState>({
    tickets: [],
    selectedTicket: null,
    loaded: false,
    error: null,
    filter: {
      status: 'all',
      searchTerm: '',
    },
    sort: {
      field: 'createdAt',
      direction: 'desc',
    },
  });

  // selectors
  tickets = computed(() => this.state().tickets);
  selectedTicket = computed(() => this.state().selectedTicket);
  loaded = computed(() => this.state().loaded);
  error = computed(() => this.state().error);
  filter = computed(() => this.state().filter);
  sort = computed(() => this.state().sort);
  filteredTickets = computed(() => {
    const { tickets } = this.state();
    const { status, searchTerm } = this.state().filter;

    return tickets.filter((ticket) => {
      const statusMatch = status === 'all' || ticket.status === status;
      const searchMatch =
        !searchTerm ||
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

      return statusMatch && searchMatch;
    });
  });
  sortedTickets = computed(() => {
    const tickets = [...this.filteredTickets()];
    const { field, direction } = this.state().sort;

    return tickets.sort((a, b) => {
      let comparison = 0;
      if (a[field] != null && b[field] != null) {
        if (a[field] < b[field]) comparison = -1;
        if (a[field] > b[field]) comparison = 1;
      }
      return direction === 'asc' ? comparison : -comparison;
    });
  });

  // sources
  private ticketsLoaded$ = this.ticketService.getTickets();
  private ticketLoaded$ = new Subject<number>();
  create$ = new Subject<CreateTicketDto>();
  update$ = new Subject<{ id: number; ticket: UpdateTicketDto }>();
  remove$ = new Subject<number>();
  setFilter$ = new Subject<Partial<TicketState['filter']>>();
  setSort$ = new Subject<Partial<TicketState['sort']>>();

  constructor() {
    // reducers
    this.ticketsLoaded$.pipe(takeUntilDestroyed()).subscribe({
      next: (tickets) =>
        this.state.update((state) => ({
          ...state,
          tickets,
          loaded: true,
          error: null,
        })),
      error: (error) =>
        this.state.update((state) => ({
          ...state,
          error: 'Failed to load tickets',
          loaded: false,
        })),
    });

    this.ticketLoaded$.pipe(takeUntilDestroyed()).subscribe((id) => {
      this.ticketService.getTicket(id).subscribe({
        next: (ticket) =>
          this.state.update((state) => ({
            ...state,
            selectedTicket: ticket,
            loaded: true,
            error: null,
          })),
        error: () =>
          this.state.update((state) => ({
            ...state,
            selectedTicket: null,
            error: 'Failed to load ticket',
            loaded: false,
          })),
      });
    });

    this.create$.pipe(takeUntilDestroyed()).subscribe((ticketDto) => {
      this.ticketService.createTicket(ticketDto).subscribe({
        next: (newTicket) =>
          this.state.update((state) => ({
            ...state,
            tickets: [...state.tickets, newTicket],
            error: null,
          })),
        error: () =>
          this.state.update((state) => ({
            ...state,
            error: 'Failed to create ticket',
          })),
      });
    });

    this.update$.pipe(takeUntilDestroyed()).subscribe(({ id, ticket }) => {
      this.ticketService.updateTicket(id, ticket).subscribe({
        next: (updatedTicket) =>
          this.state.update((state) => ({
            ...state,
            tickets: state.tickets.map((t) =>
              t.id === updatedTicket.id ? updatedTicket : t
            ),
            error: null,
          })),
        error: () =>
          this.state.update((state) => ({
            ...state,
            error: 'Failed to update ticket',
          })),
      });
    });

    this.remove$.pipe(takeUntilDestroyed()).subscribe((id) => {
      this.ticketService.deleteTicket(id).subscribe({
        next: () =>
          this.state.update((state) => ({
            ...state,
            tickets: state.tickets.filter((t) => t.id !== id),
            error: null,
          })),
        error: () =>
          this.state.update((state) => ({
            ...state,
            error: 'Failed to delete ticket',
          })),
      });
    });

    this.setFilter$.pipe(takeUntilDestroyed()).subscribe((filter) => {
      this.state.update((state) => ({
        ...state,
        filter: { ...state.filter, ...filter },
      }));
    });

    this.setSort$.pipe(takeUntilDestroyed()).subscribe((sort) => {
      this.state.update((state) => ({
        ...state,
        sort: { ...state.sort, ...sort },
      }));
    });
  }

  // public methods
  loadTickets(): void {
    this.ticketsLoaded$.subscribe();
  }

  loadTicket(id: number): void {
    this.state.update((state) => ({
      ...state,
      loaded: false,
      selectedTicket: null,
      error: null,
    }));
    this.ticketLoaded$.next(id);
  }

  createTicket(ticket: CreateTicketDto): void {
    this.create$.next(ticket);
  }

  updateTicket(id: number, ticket: UpdateTicketDto): void {
    this.update$.next({ id, ticket });
  }

  deleteTicket(id: number): void {
    this.remove$.next(id);
  }

  setFilter(filter: Partial<TicketState['filter']>): void {
    this.setFilter$.next(filter);
  }

  setSort(sort: Partial<TicketState['sort']>): void {
    this.setSort$.next(sort);
  }

  clearError(): void {
    this.state.update((state) => ({ ...state, error: null }));
  }
}
