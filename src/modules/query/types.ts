export type DealerQuery = {
  id: number;
  query: string;
  subject: string;
  remarks: string;
  status: string;
  created_at: string;
};

export type CreateQueryPayload = {
  subject: string;
  query: string;
  remarks: string;
  status: string;
};

export type UpdateQueryPayload = CreateQueryPayload & {
  id: number;
};
