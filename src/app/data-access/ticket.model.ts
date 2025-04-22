export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in progress' | 'closed';
  createdAt: Date;
  updatedAt?: Date | null;
}

export type CreateTicketDto = Pick<Ticket, 'title' | 'description' | 'status'>;

export type UpdateTicketDto = Partial<CreateTicketDto>;

export type Filter = {
  status: 'all' | 'open' | 'in progress' | 'closed';
  searchTerm: string;
};

export type Sort = {
  field: keyof Ticket;
  direction: 'asc' | 'desc';
};
