import {
  getAllByTestId,
  render,
  screen,
  within,
} from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import TicketListComponent from './ticket-list.component';
import { TicketsService } from '../../data-access/tickets.service';
import { signal, computed } from '@angular/core';
import { Ticket, Filter, Sort } from '../../data-access/ticket.model';
import { Subject } from 'rxjs';
import { TicketItemComponent } from '../../ui/ticket-item/ticket-item.component';
import { TicketFormComponent } from '../../ui/ticket-form/ticket-form.component';
import { FilterSortComponent } from '../../ui/filter-sort/filter-sort.component';

describe('TicketListComponent', () => {
  let mockTickets: Ticket[];
  let mockTicketsService: Partial<TicketsService>;
  let createTicketSpy: Subject<any>;
  let changeStatusSpy: Subject<any>;
  let deleteTicketSpy: Subject<any>;
  let filterChangeSpy: Subject<any>;
  let sortChangeSpy: Subject<any>;
  const defaultFilter: Filter = { status: 'all', searchTerm: '' };
  const defaultSort: Sort = { field: 'createdAt', direction: 'asc' as const };

  const setupMockService = (
    options: {
      tickets?: Ticket[];
      isLoaded?: boolean;
      error?: string | null;
      filter?: Filter;
      sort?: Sort;
    } = {}
  ) => {
    createTicketSpy = new Subject();
    changeStatusSpy = new Subject();
    deleteTicketSpy = new Subject();
    filterChangeSpy = new Subject();
    sortChangeSpy = new Subject();

    return {
      tickets: computed(() => options.tickets || mockTickets),
      loaded: computed(() => options.isLoaded ?? true),
      error: computed(() => options.error || null),
      filter: computed(() => options.filter || defaultFilter),
      sort: computed(() => options.sort || defaultSort),
      createTicket$: createTicketSpy,
      changeStatus$: changeStatusSpy,
      deleteTicket$: deleteTicketSpy,
      filterChange$: filterChangeSpy,
      sortChange$: sortChangeSpy,
    };
  };

  const renderComponent = (serviceOptions = {}) => {
    mockTicketsService = setupMockService(serviceOptions);

    return render(TicketListComponent, {
      imports: [TicketItemComponent, TicketFormComponent, FilterSortComponent],
      providers: [{ provide: TicketsService, useValue: mockTicketsService }],
    });
  };

  beforeEach(() => {
    mockTickets = [
      {
        id: 1,
        title: 'First ticket',
        description: 'Description for first ticket',
        status: 'open',
        createdAt: new Date('2025-05-01'),
        updatedAt: null,
      },
      {
        id: 2,
        title: 'Second ticket',
        description: 'Description for second ticket',
        status: 'closed',
        createdAt: new Date('2025-05-02'),
        updatedAt: new Date('2025-05-03'),
      },
    ];
  });

  describe('Render States', () => {
    it('should show loading state when tickets are not loaded', async () => {
      await renderComponent({ isLoaded: false });
      expect(screen.getByText('Loading...'));
    });

    it('should show error message when there is an error', async () => {
      const errorMessage = 'Failed to load tickets';
      await renderComponent({ error: errorMessage });
      expect(screen.getByText(errorMessage));
    });

    it('should render ticket items when tickets are loaded without errors', async () => {
      await renderComponent();

      const ticketItems = screen.getAllByTestId(/ticket-item/);
      expect(ticketItems.length).toBe(mockTickets.length);

      expect(screen.getByText('First ticket'));
      expect(screen.getByText('Second ticket'));
    });

    it('should render the filter-sort component', async () => {
      await renderComponent();

      expect(screen.getByTestId('filter-sort'));
    });
  });

  describe('Event Handling', () => {
    it('should forward create event from ticket-form to ticketService', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const spy = jest.spyOn(mockTicketsService.createTicket$!, 'next');
      const newTicket = {
        title: 'New Ticket',
        description: 'Description',
        status: 'open',
      };

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const statusSelect = screen.getByLabelText(/^status$/i);
      const createButton = screen.getByRole('button', { name: /create/i });

      await user.type(titleInput, newTicket.title);
      await user.type(descriptionInput, newTicket.description);
      await user.selectOptions(statusSelect, newTicket.status);
      await user.click(createButton);

      expect(spy).toHaveBeenCalledWith(newTicket);
    });

    it('should forward filter changes to ticketService', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const spy = jest.spyOn(mockTicketsService.filterChange$!, 'next');

      const statusSelect = screen.getByRole('combobox', {
        name: /status-select/i,
      });
      const searchInput = screen.getByPlaceholderText('Search tickets...');

      await user.selectOptions(statusSelect, 'closed');

      expect(spy).toHaveBeenLastCalledWith({
        ...defaultFilter,
        status: 'closed',
      });

      await user.type(searchInput, 'test');

      expect(spy).toHaveBeenLastCalledWith({
        ...defaultFilter,
        searchTerm: 'test',
      });
    });

    it('should forward sort changes to ticketService', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const spy = jest.spyOn(mockTicketsService.sortChange$!, 'next');

      const sortSelect = screen.getByRole('combobox', { name: /sort-select/i });
      await user.selectOptions(sortSelect, 'title');

      expect(spy).toHaveBeenCalledWith({ ...defaultSort, field: 'title' });

      const sortDirectionButton = screen.getByRole('button', {
        name: /sort-direction/i,
      });
      await user.click(sortDirectionButton);

      expect(spy).toHaveBeenCalledWith({
        ...defaultSort,
        direction: 'desc',
      });
    });

    it('should forward status changes from ticket-item to ticketService', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const spy = jest.spyOn(mockTicketsService.changeStatus$!, 'next');
      const statusChange = { ticket: mockTickets[0], status: 'closed' };

      // Get the first ticket item using test-id
      const firstTicketItem = screen.getByTestId(
        `ticket-item-${mockTickets[0].id}`
      );

      // Find the complete button within this ticket item
      const completeButton =
        within(firstTicketItem).getByText('Mark as Complete');

      await user.click(completeButton);

      expect(spy).toHaveBeenCalledWith(statusChange);
    });

    it('should forward delete events from ticket-item to ticketService', async () => {
      const user = userEvent.setup();
      await renderComponent();

      const spy = jest.spyOn(mockTicketsService.deleteTicket$!, 'next');
      const ticketToDelete = mockTickets[0];

      const firstTicketItem = screen.getByTestId(
        `ticket-item-${mockTickets[0].id}`
      );

      // Find the complete button within this ticket item
      const deleteButton = within(firstTicketItem).getByRole('button', {
        name: /delete/i,
      });

      await user.click(deleteButton);

      expect(spy).toHaveBeenCalledWith(ticketToDelete);
    });
  });
});
