import { fireEvent, render, screen } from '@testing-library/angular';
import { TicketItemComponent } from './ticket-item.component';
import { Ticket } from '../../data-access/ticket.model';

describe('TicketItemComponent', () => {
  let mockTicket: Ticket;
  let deleteSpy: jest.Mock;
  let statusChangeSpy: jest.Mock;

  const renderComponent = (ticket = mockTicket) => {
    return render(TicketItemComponent, {
      inputs: {
        ticket,
      },
      on: {
        delete: deleteSpy,
        statusChange: statusChangeSpy,
      },
    });
  };

  beforeEach(async () => {
    mockTicket = {
      id: 1,
      title: 'Test Ticket',
      description: 'This is a test ticket',
      status: 'open',
      createdAt: new Date(),
      updatedAt: null,
    };

    deleteSpy = jest.fn();
    statusChangeSpy = jest.fn();
  });

  describe('UI Elements', () => {
    it('should display ticket information correctly', async () => {
      await renderComponent();

      expect(screen.getByText(mockTicket.title));
      expect(screen.getByText(mockTicket.description));
      expect(screen.getByText('Open'));
      expect(screen.getByText(/created:/i));
    });
  });

  describe('User Interactions', () => {
    it('should trigger delete event when Delete button is clicked', async () => {
      await renderComponent();

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(deleteSpy).toHaveBeenCalledWith(mockTicket);
    });

    it('should have correct Edit link with proper routerLink', async () => {
      await renderComponent();

      const editLink = screen.getByRole('link', { name: /edit/i });
      expect(editLink).toBeInTheDocument();
      expect(editLink.getAttribute('href')).toContain(
        `/tickets/${mockTicket.id}`
      );
    });

    it('should trigger statusChange event when Mark as Complete button is clicked', async () => {
      await renderComponent();

      const completeButton = screen.getByRole('button', {
        name: /mark as complete/i,
      });
      fireEvent.click(completeButton);

      expect(statusChangeSpy).toHaveBeenCalledWith({
        ticket: mockTicket,
        status: 'closed',
      });
    });
  });

  describe('Conditional Rendering', () => {
    it('should not show Mark as Complete button for closed tickets', async () => {
      const closedTicket: Ticket = { ...mockTicket, status: 'closed' };
      await renderComponent(closedTicket);

      const completeButton = screen.queryByRole('button', {
        name: /mark as complete/i,
      });
      expect(completeButton).not.toBeInTheDocument();
    });

    it('should show correct status styling based on ticket status', async () => {
      const { rerender } = await renderComponent();

      const ticketItem = screen
        .getByText(mockTicket.title)
        .closest('.ticket-item');
      expect(ticketItem).toHaveClass('status-open');

      // Testing with a different status
      const closedTicket: Ticket = { ...mockTicket, status: 'closed' };
      await rerender({ inputs: { ticket: closedTicket } });

      expect(
        screen.getByText(closedTicket.title).closest('.ticket-item')
      ).toHaveClass('status-closed');
    });
  });
});
