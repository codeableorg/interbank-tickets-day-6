export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in progress' | 'closed';
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface TicketState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loaded: boolean;
  error: string | null;
  filter: {
    status: 'all' | 'open' | 'in progress' | 'closed';
    searchTerm: string;
  };
  sort: {
    field: keyof Ticket;
    direction: 'asc' | 'desc';
  };
}

export interface CreateTicketDto {
  title: string;
  description: string;
  status: 'open' | 'in progress' | 'closed';
}

export type UpdateTicketDto = Partial<CreateTicketDto>;
