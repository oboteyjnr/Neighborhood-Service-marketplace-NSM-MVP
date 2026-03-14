export type QuoteStatus = 'pending' | 'accepted' | 'rejected';

export interface QuoteRequestSummaryDto {
  _id: string;
  title: string;
  status: 'open' | 'quoted' | 'assigned' | 'completed' | 'cancelled';
  categoryId: string | { _id: string; name: string };
  location?: string;
}

export interface QuoteDto {
  _id: string;
  requestId: string | QuoteRequestSummaryDto;
  providerId: string | { _id: string; name: string; email: string };
  price: number;
  daysToComplete: number;
  message?: string;
  status: QuoteStatus;
  assignmentSource?: 'accepted_quote' | 'direct_assignment';
  createdAt: string;
  updatedAt: string;
}
