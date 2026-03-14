import { CategoryDto } from './category.dto';
import { UserDto } from './user.dto';

export type RequestStatus = 'open' | 'quoted' | 'assigned' | 'completed' | 'cancelled';

export interface ServiceRequestDto {
  _id: string;
  residentId: string;
  categoryId: string | CategoryDto;
  title: string;
  description: string;
  location: string;
  status: RequestStatus;
  assignedQuoteId?: string | null;
  assignedProviderId?: string | UserDto | null;
  createdAt: string;
  updatedAt: string;
}
