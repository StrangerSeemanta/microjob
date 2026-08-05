export interface UserDataTypeClerk {
  id: string;
  email_addresses: { email_address: string | null | undefined }[];
  username: string;
  first_name: string;
  last_name: string;
  image_url: string;
  public_metadata?: {
    role?: string;
    balance?: number;
  };
}
