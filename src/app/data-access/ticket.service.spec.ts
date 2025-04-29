import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TicketsService } from './tickets.service';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Ticket } from './ticket.model';
import { provideHttpClient } from '@angular/common/http';

describe('TicketService', () => {
  let service: TicketsService;
  let apiUrl = 'http://localhost:3000/api/tickets';

  // Helper function to create mock tickets
  const createMockTicket = (
    id: number,
    overrides?: Partial<Ticket>
  ): Ticket => ({
    id,
    title: `Test Ticket ${id}`,
    description: `Description for ticket ${id}`,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  // Mock -> Simulación o falsificación de algo
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TicketsService,
      ],
    });
    service = TestBed.inject(TicketsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', fakeAsync(() => {
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    tick();

    expect(service).toBeTruthy();
  }));

  it('should have correct initial state', fakeAsync(() => {
    const req = httpMock.expectOne(`${apiUrl}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    tick();

    expect(service.tickets()).toEqual([]);
    expect(service.loaded()).toBe(true);
    expect(service.error()).toBeNull();
    expect(service.filter()).toEqual({ status: 'all', searchTerm: '' });
    expect(service.sort()).toEqual({ field: 'createdAt', direction: 'asc' });
  }));

  describe('Fetch Tickets', () => {
    it('should fetch initial tickets', fakeAsync(() => {
      // Simulacion/falsificación de tickets
      const mockTickets: Ticket[] = [createMockTicket(1), createMockTicket(2)];

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTickets);
      tick();

      expect(service.tickets()).toEqual(mockTickets);
      expect(service.tickets().length).toBe(2);
      expect(service.loaded()).toBe(true);
      expect(service.error()).toBeNull();
    }));

    it('should handle error when fetching tickets', fakeAsync(() => {
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      const errorMessage = 'Failed to fetch tickets';
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
      tick();

      expect(service.loaded()).toBe(true);
      expect(service.tickets().length).toBe(0);
      expect(service.error()).toBe(errorMessage);
    }));
  });
});
