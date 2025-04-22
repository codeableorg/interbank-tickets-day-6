import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TicketsService } from './tickets.service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

describe('TicketService', () => {
  let service: TicketsService;
  let apiUrl = 'http://localhost:3000/api/tickets';

  // Mock -> Simulación o falsificación de algo
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TicketsService,
        provideHttpClientTesting(),
        provideHttpClient(),
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

  it('should fetch initial tickets', () => {
    // Simulacion/falsificación de tickets
    const mockTickets = [
      { id: 1, title: 'Ticket 1' },
      { id: 2, title: 'Ticket 2' },
    ];

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockTickets);

    // expect(service.tickets()).toEqual(mockTickets);
    // expect(service.tickets().length).toBe(2);
    // expect(service.tickets()[0].title).toBe('Ticket 1');
    // expect(service.tickets()[1].title).toBe('Ticket 2');
    // expect(service.loaded()).toBe(true);
    // expect(service.error()).toBe(null);
  });
});
