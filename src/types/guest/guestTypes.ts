export interface GuestDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  nationality?: string;
  notes?: string;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
