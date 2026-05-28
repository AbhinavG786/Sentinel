export interface Policy {
  id: string;
  name: string;
  description?: string;
  blocked_keywords: string[];
  allowed_domains: string[];
  created_at: string;
  updated_at: string;
}

export interface PolicyListResponse {
  data: Policy[];
  total: number;
}

export interface CreatePolicyDto {
  name: string;
  description?: string;
  blocked_keywords: string[];
  allowed_domains: string[];
}

export interface UpdatePolicyDto extends Partial<CreatePolicyDto> {}
