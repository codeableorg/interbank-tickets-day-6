export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in progress' | 'closed';
  createdAt: Date;
  updatedAt?: Date | null;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  status: 'open' | 'in progress' | 'closed';
}

export type UpdateTicketDto = Partial<CreateTicketDto>;
