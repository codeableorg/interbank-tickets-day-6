import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TicketsService } from './tickets.service';
import { TestBed } from '@angular/core/testing';
import { Ticket } from './ticket.model';
import { provideHttpClient } from '@angular/common/http';

describe('TicketService', () => {
  let service: TicketsService;
  let apiUrl = 'http://localhost:3000/api/tickets';

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

  it('should be created', () => {
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    expect(service).toBeTruthy();
  });

  it('should have correct initial state', () => {
    const req = httpMock.expectOne(`${apiUrl}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    expect(service.tickets()).toEqual([]);
    expect(service.loaded()).toBe(true);
    expect(service.error()).toBeNull();
    expect(service.filter()).toEqual({ status: 'all', searchTerm: '' });
    expect(service.sort()).toEqual({ field: 'createdAt', direction: 'asc' });
  });

  describe('Fetch Tickets', () => {
    it('should fetch initial tickets', () => {
      // Simulacion/falsificación de tickets
      const mockTickets: Ticket[] = [
        {
          id: 1,
          title: 'Ticket 1',
          status: 'open',
          description: 'Description 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          title: 'Ticket 2',
          status: 'open',
          description: 'Description 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTickets);

      expect(service.tickets()).toEqual(mockTickets);
      expect(service.tickets().length).toBe(2);
      expect(service.loaded()).toBe(true);
      expect(service.error()).toBe(null);
    });
  });
});
