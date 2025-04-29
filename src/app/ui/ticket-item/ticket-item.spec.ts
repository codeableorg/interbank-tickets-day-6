import { fireEvent, render, screen } from '@testing-library/angular';
import { TicketItemComponent } from './ticket-item.component';
import { Ticket } from '../../data-access/ticket.model';

describe('TicketItemComponent', () => {
  it('should render the ticket-item component', async () => {
    const mockTicket: Ticket = {
      id: 1,
      title: 'Test Ticket',
      description: 'This is a test ticket',
      status: 'open',
      createdAt: new Date(),
      updatedAt: null,
    };

    const deleteSpy = jest.fn();

    await render(TicketItemComponent, {
      inputs: {
        ticket: mockTicket,
      },
      on: {
        delete: deleteSpy,
        statusChange: () => {},
      },
    });

    const titleEl = screen.getByText(mockTicket.title);
    expect(titleEl).toBeInTheDocument();

    const button = screen.getByRole('button', {
      name: /delete/i,
    });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(deleteSpy).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith(mockTicket);
  });
});
