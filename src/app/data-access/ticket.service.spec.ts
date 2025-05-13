import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TicketsService } from './tickets.service';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  CreateTicketDto,
  Filter,
  Sort,
  Ticket,
  UpdateTicketDto,
} from './ticket.model';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

describe('TicketService', () => {
  let service: TicketsService;
  let apiUrl = environment.apiUrl;

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
    const req = httpMock.expectOne(apiUrl);
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

  describe('Create Ticket', () => {
    it('should add a new ticket to the state via createTicket$', fakeAsync(() => {
      // Flush initial GET request
      const initReq = httpMock.expectOne(apiUrl);
      expect(initReq.request.method).toBe('GET');
      initReq.flush([]);

      const newTicketDto: CreateTicketDto = {
        title: 'New Ticket',
        description: 'New Desc',
        status: 'open',
      };
      const createdTicket = createMockTicket(3, newTicketDto); // Assume ID 3 is returned

      service.createTicket$.next(newTicketDto); // Trigger the source subject
      tick();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTicketDto);
      req.flush(createdTicket); // Simulate successful API response
      tick();

      expect(service.tickets().length).toBe(1);
      expect(service.tickets()[0]).toEqual(createdTicket);
      expect(service.error()).toBeNull();
    }));

    it('should handle error when creating a ticket', fakeAsync(() => {
      // Flush initial GET request
      const initReq = httpMock.expectOne(apiUrl);
      expect(initReq.request.method).toBe('GET');
      initReq.flush([]);

      const newTicketDto: CreateTicketDto = {
        title: 'New Ticket',
        description: 'New Desc',
        status: 'open',
      };
      const errorMessage = 'Failed to create ticket';

      service.createTicket$.next(newTicketDto);
      tick();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
      tick();

      expect(service.tickets().length).toBe(0); // Ticket should not be added
      expect(service.error()).toBe(errorMessage);
    }));
  });

  describe('Update Ticket', () => {
    beforeEach(fakeAsync(() => {
      const initialTicket = createMockTicket(1);
      const initReq = httpMock.expectOne(apiUrl);
      initReq.flush([initialTicket]); // Start with one ticket
      tick();
    }));

    it('should update an existing ticket in the state via updateTicket$', fakeAsync(() => {
      const ticketToUpdate = service.tickets()[0];
      const updateDto: UpdateTicketDto = { title: 'Updated Title' };
      const updatedTicket = {
        ...ticketToUpdate,
        ...updateDto,
        updatedAt: new Date(),
      }; // Simulate backend update

      service.updateTicket$.next({ id: ticketToUpdate.id, dto: updateDto });
      tick();

      const req = httpMock.expectOne(`${apiUrl}/${ticketToUpdate.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateDto);
      req.flush(updatedTicket);
      tick();

      expect(service.tickets().length).toBe(1);
      expect(service.tickets()[0].title).toBe('Updated Title');
      expect(service.tickets()[0].id).toBe(ticketToUpdate.id);
      expect(service.error()).toBeNull();
    }));

    it('should handle error when updating a ticket', fakeAsync(() => {
      const ticketToUpdate = service.tickets()[0];
      const updateDto: UpdateTicketDto = { title: 'Updated Title' };
      const errorMessage = 'Failed to update ticket';

      service.updateTicket$.next({ id: ticketToUpdate.id, dto: updateDto });
      tick();

      const req = httpMock.expectOne(`${apiUrl}/${ticketToUpdate.id}`);
      expect(req.request.method).toBe('PUT');
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
      tick();

      expect(service.tickets().length).toBe(1);
      expect(service.tickets()[0].title).toBe(ticketToUpdate.title); // Title should not have changed
    }));
  });

  describe('Change Status', () => {
    beforeEach(fakeAsync(() => {
      const initialTicket = createMockTicket(1, { status: 'open' });
      const initReq = httpMock.expectOne(apiUrl);
      initReq.flush([initialTicket]);
      tick();
    }));

    it('should update ticket status via changeStatus$', fakeAsync(() => {
      const ticketToChange = service.tickets()[0];
      const newStatus = 'closed';
      const updatedTicket = {
        ...ticketToChange,
        status: newStatus,
        updatedAt: new Date(),
      };

      service.changeStatus$.next({ ticket: ticketToChange, status: newStatus });
      tick();

      const req = httpMock.expectOne(`${apiUrl}/${ticketToChange.id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toMatchObject({ status: newStatus });
      req.flush(updatedTicket);
      tick();

      expect(service.tickets().length).toBe(1);
      expect(service.tickets()[0].status).toBe(newStatus);
      expect(service.error()).toBeNull();
    }));

    it('should handle error when changing status', fakeAsync(() => {
      const ticketToChange = service.tickets()[0];
      const newStatus = 'closed';
      const errorMessage = 'Failed to update ticket';

      service.changeStatus$.next({ ticket: ticketToChange, status: newStatus });
      tick();

      const req = httpMock.expectOne(`${apiUrl}/${ticketToChange.id}`);
      expect(req.request.method).toBe('PUT');
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
      tick();

      expect(service.tickets().length).toBe(1);
      expect(service.tickets()[0].status).toBe(ticketToChange.status); // Status should not change
    }));
  });

  describe('Delete Ticket', () => {
    beforeEach(fakeAsync(() => {
      const initialTicket = createMockTicket(1);
      const initReq = httpMock.expectOne(apiUrl);
      initReq.flush([initialTicket]);
    }));

    it('should remove a ticket from the state via deleteTicket$', fakeAsync(() => {
      const ticketToDelete = service.tickets()[0];

      service.deleteTicket$.next(ticketToDelete);
      tick();

      const req = httpMock.expectOne(`${apiUrl}/${ticketToDelete.id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' }); // Simulate successful delete
      tick();

      expect(service.tickets().length).toBe(0);
      expect(service.error()).toBeNull();
    }));

    it('should handle error when deleting a ticket', fakeAsync(() => {
      const ticketToDelete = service.tickets()[0];
      const errorMessage = 'Failed to delete ticket';

      service.deleteTicket$.next(ticketToDelete);
      tick();

      const req = httpMock.expectOne(`${apiUrl}/${ticketToDelete.id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
      tick();

      expect(service.tickets().length).toBe(1); // Ticket should still be there
      expect(service.error()).toBe(errorMessage);
    }));
  });

  describe('Filtering and Sorting', () => {
    const ticket1 = createMockTicket(1, {
      title: 'Alpha Open',
      status: 'open',
      createdAt: new Date(2025, 3, 20),
    });
    const ticket2 = createMockTicket(2, {
      title: 'Beta Closed',
      status: 'closed',
      createdAt: new Date(2025, 3, 22),
    });
    const ticket3 = createMockTicket(3, {
      title: 'Gamma Open',
      status: 'open',
      createdAt: new Date(2025, 3, 21),
      description: 'Search Me Please', // Set unique description for filtering test
    });

    beforeEach(fakeAsync(() => {
      const initReq = httpMock.expectOne(`${apiUrl}`);
      initReq.flush([ticket1, ticket2, ticket3]); // Start with three tickets
      tick();
    }));

    it('should update filter state via filterChange$', () => {
      const newFilter: Filter = { status: 'open', searchTerm: 'gam' };
      service.filterChange$.next(newFilter);
      expect(service.filter()).toEqual(newFilter);
    });

    it('should filter tickets by status', () => {
      service.filterChange$.next({ status: 'open', searchTerm: '' });
      const filteredTickets = service.tickets();
      expect(filteredTickets.length).toBe(2);
      expect(filteredTickets.map((t) => t.id)).toEqual([1, 3]);

      service.filterChange$.next({ status: 'closed', searchTerm: '' });
      expect(service.tickets().length).toBe(1);
      expect(service.tickets()[0].id).toBe(2);

      service.filterChange$.next({ status: 'all', searchTerm: '' });
      expect(service.tickets().length).toBe(3);
    });

    it('should filter tickets by search term (title)', () => {
      service.filterChange$.next({ status: 'all', searchTerm: 'beta' });
      const filteredTickets = service.tickets();
      expect(filteredTickets.length).toBe(1);
      expect(filteredTickets[0].id).toBe(2);
    });

    it('should filter tickets by search term (description - case insensitive)', () => {
      service.filterChange$.next({ status: 'all', searchTerm: 'search me' });
      const filteredTickets = service.tickets();
      expect(filteredTickets.length).toBe(1);
      expect(filteredTickets[0].id).toBe(3);
    });

    it('should filter tickets by status and search term', () => {
      service.filterChange$.next({ status: 'open', searchTerm: 'alpha' });
      const filteredTickets = service.tickets();
      expect(filteredTickets.length).toBe(1);
      expect(filteredTickets[0].id).toBe(1);
    });

    it('should update sort state via sortChange$', () => {
      const newSort: Sort = { field: 'title', direction: 'desc' };
      service.sortChange$.next(newSort);
      expect(service.sort()).toEqual(newSort);
    });

    it('should sort tickets by title ascending', () => {
      service.sortChange$.next({ field: 'title', direction: 'asc' });
      const sortedTickets = service.tickets();
      expect(sortedTickets.map((t) => t.title)).toEqual([
        'Alpha Open',
        'Beta Closed',
        'Gamma Open',
      ]);
    });

    it('should sort tickets by title descending', () => {
      service.sortChange$.next({ field: 'title', direction: 'desc' });
      const sortedTickets = service.tickets();
      expect(sortedTickets.map((t) => t.title)).toEqual([
        'Gamma Open',
        'Beta Closed',
        'Alpha Open',
      ]);
    });

    it('should sort tickets by createdAt descending (default is asc)', () => {
      service.sortChange$.next({ field: 'createdAt', direction: 'desc' });
      const sortedTickets = service.tickets();
      expect(sortedTickets.map((t) => t.id)).toEqual([2, 3, 1]);
    });

    it('should sort tickets by status ascending', () => {
      service.sortChange$.next({ field: 'status', direction: 'asc' });
      const sortedTickets = service.tickets();
      expect(sortedTickets.map((t) => t.id)).toEqual([2, 1, 3]);
    });
  });
});
