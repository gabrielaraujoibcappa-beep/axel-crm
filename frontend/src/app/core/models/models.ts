// ── Base ─────────────────────────────────────────────────────────────
export interface BaseEntity {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  organizationId?: string;
}

// ── Paginated response (Spring Boot Page<T>) ────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;  // 0-based page index
}

// ── Auth ─────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}
export interface RegisterRequest {
  organizationName: string;
  fullName: string;
  email: string;
  password: string;
}
export interface AuthResponse {
  token: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
}

// ── Organization ─────────────────────────────────────────────────────
export interface Organization extends BaseEntity {
  name: string;
  domain?: string;
  subscriptionPlan?: string;
}

// ── User ─────────────────────────────────────────────────────────────
export interface User extends BaseEntity {
  name: string;
  fullName?: string;
  email: string;
  role: string;
  isActive?: boolean;
  active?: boolean;
}

// ── Client ───────────────────────────────────────────────────────────
export interface Client extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  companyName?: string;
  website?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
  active?: boolean;
  status?: string;
  serviceType?: string;
  assignedToUserId?: string;
}

// ── Contact ──────────────────────────────────────────────────────────
export interface Contact extends BaseEntity {
  clientId?: string;
  client?: Client;
  leadId?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  notes?: string;
  contactType?: string;
  isPrimary?: boolean;
}

// ── Lead ─────────────────────────────────────────────────────────────
export interface Lead extends BaseEntity {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  stage?: string;
  status?: string;
  source?: string;
  estimatedValue?: number;
  notes?: string;
  score?: number;
  lastContactAt?: string;
  assignedToUserId?: string;
  assignedTo?: User;
  convertedClientId?: string;
  convertedAt?: string;
  partnerId?: string;
}

// ── Prospect ─────────────────────────────────────────────────────────
export interface Prospect extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source: string;
  stage: string;
  notes?: string;
  convertedLeadId?: string;
  convertedAt?: string;
}

// ── Deal ─────────────────────────────────────────────────────────────
export interface Deal extends BaseEntity {
  clientId?: string;
  clientName?: string;
  contactId?: string;
  leadId?: string;
  title: string;
  name?: string;
  description?: string;
  value?: number;
  amount?: number;
  expectedCloseDate?: string;
  stageId?: string;
  stageName?: string;
  pipelineId?: string;
  pipelineName?: string;
  won?: boolean;
  status?: string;
  assignedToUserId?: string;
  assignedToName?: string;
}

// ── Pipeline & Stage ─────────────────────────────────────────────────
export interface Pipeline extends BaseEntity {
  name: string;
  description?: string;
  isActive?: boolean;
  active?: boolean;
}
export interface PipelineStage extends BaseEntity {
  pipelineId: string;
  name: string;
  orderIndex?: number;
  probability?: number;
}

// ── Project ──────────────────────────────────────────────────────────
export interface Project extends BaseEntity {
  clientId?: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  budget?: number;
  cost?: number;
  managerUserId?: string;
  sourceProposalId?: string;
}

// ── Task ─────────────────────────────────────────────────────────────
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  dueDate?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  leadId?: string;
  clientId?: string;
  dealId?: string;
}

// ── Proposal ─────────────────────────────────────────────────────────
export interface Proposal extends BaseEntity {
  clientId?: string;
  clientName?: string;
  dealId?: string;
  title: string;
  proposalCode?: string;
  publicToken?: string;
  description?: string;
  status?: string;
  totalAmount?: number;
  discountAmount?: number;
  validUntil?: string;
  approvedAt?: string;
  assignedToUserId?: string;
  client?: Client;
  assignedTo?: User;
  items?: ProposalItem[];
  partnerId?: string;

  // Dados jurídicos e periciais
  /** Advogado vinculado, escolhido entre os contatos do tipo LAWYER. */
  lawyerContactId?: string;
  /** Nome do advogado: o do contato vinculado ou o texto livre informado. */
  lawyerName?: string;
  /** Origem da indicação. Quem indicou é o partnerId. */
  referralSource?: string;
  /** Perito responsável. Não participa do rateio de comissão. */
  expertUser?: User;
  /** Responsável técnico. Não participa do rateio de comissão. */
  technicalManagerUser?: User;
  /** Projeto vinculado a esta proposta. */
  projectId?: string;
  projectName?: string;
}
export interface ProposalItem extends BaseEntity {
  proposalId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

// ── Campaign ─────────────────────────────────────────────────────────
export interface Campaign extends BaseEntity {
  name: string;
  type?: string;
  content?: string;
  status?: string;
  scheduledAt?: string;
  sentAt?: string;
  recipientsCount?: number;
  sentCount?: number;
  openCount?: number;
  clickCount?: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  expectedRevenue?: number;
}

// ── Support Ticket ───────────────────────────────────────────────────
export interface SupportTicket extends BaseEntity {
  clientId?: string;
  clientName?: string;
  subject: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  createdByUserId?: string;
  createdByName?: string;
}

// ── Financial Transaction ────────────────────────────────────────────
export interface FinancialTransaction extends BaseEntity {
  clientId?: string;
  clientName?: string;
  type?: string;
  transactionType?: string;
  amount: number;
  date?: string;
  transactionDate?: string;
  dueDate?: string;
  paidAt?: string;
  paid?: boolean;
  description?: string;
  category?: string;
  bankAccountId?: string;
  bankAccountName?: string;
  dealId?: string;
  dealTitle?: string;
}

// ── Bank Account ─────────────────────────────────────────────────────
export interface BankAccount extends BaseEntity {
  name: string;
  accountNumber?: string;
  bankName?: string;
  agency?: string;
  balance?: number;
  currentBalance?: number;
  currency?: string;
  active?: boolean;
}

// ── Time Entry ───────────────────────────────────────────────────────
export interface TimeEntry extends BaseEntity {
  projectId: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
  userId?: string;
  userName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  hours?: number;
  durationMinutes?: number;
  description?: string;
  billable?: boolean;
  hourlyRate?: number;
}

// ── Commission ───────────────────────────────────────────────────────
export interface Commission extends BaseEntity {
  userId?: string;
  userName?: string;
  dealId?: string;
  dealTitle?: string;
  ruleId?: string;
  ruleName?: string;
  dealValue?: number;
  amount: number;
  date?: string;
  paidAt?: string;
  status?: string;
  paid?: boolean;
}
export interface CommissionRule extends BaseEntity {
  name: string;
  percentage: number;
  isActive?: boolean;
}

// ── Integration ──────────────────────────────────────────────────────
export interface Integration extends BaseEntity {
  providerName: string;
  apiKey?: string;
  apiSecret?: string;
  isActive?: boolean;
  settings?: any;
}

// ── Audit Log ────────────────────────────────────────────────────────
export interface AuditLog extends BaseEntity {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
}

// ── Notification ─────────────────────────────────────────────────────
export interface Notification extends BaseEntity {
  userId?: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
}

// ── Calendar Event ───────────────────────────────────────────────────
export interface CalendarEvent extends BaseEntity {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location?: string;
  userId: string;
  leadId?: string;
  clientId?: string;
  dealId?: string;
}

// ── Client details additions ─────────────────────────────────────────
export interface ClientNote extends BaseEntity {
  clientId: string;
  userId?: string;
  userName?: string;
  content: string;
}

export interface ClientAttachment extends BaseEntity {
  clientId: string;
  userId?: string;
  userName?: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
}

export interface TimelineItem {
  id: string;
  type: 'NOTE' | 'SYSTEM_LOG';
  action?: string;
  content: string;
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface LeadNote extends BaseEntity {
  leadId: string;
  userId?: string;
  userName?: string;
  content: string;
}

// ── Contract ─────────────────────────────────────────────────────────
export interface Contract extends BaseEntity {
  clientId?: string;
  clientName?: string;
  dealId?: string;
  dealTitle?: string;
  title: string;
  contractNumber?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  value?: number;
  monthlyValue?: number;
  status?: string;
  terms?: string;
  notes?: string;
  signedByClient?: string;
  signedAt?: string;
  renewedAt?: string;
  autoRenew?: boolean;
}

// ── Invoice ──────────────────────────────────────────────────────────
export interface Invoice extends BaseEntity {
  invoiceNumber?: string;
  clientId?: string;
  clientName?: string;
  contractId?: string;
  contractTitle?: string;
  issueDate?: string;
  dueDate?: string;
  paidDate?: string;
  status?: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  total?: number;
  notes?: string;
  paymentMethod?: string;
  paidAmount?: number;
}

// ── Product ──────────────────────────────────────────────────────────
export interface Product extends BaseEntity {
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  unitPrice?: number;
  costPrice?: number;
  unit?: string;
  isActive?: boolean;
  notes?: string;
}

// ── Document ─────────────────────────────────────────────────────────
export interface Document extends BaseEntity {
  name: string;
  description?: string;
  category?: string;
  tags?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileUrl?: string;
  clientId?: string;
  clientName?: string;
  dealId?: string;
  dealTitle?: string;
  contractId?: string;
  contractTitle?: string;
  projectId?: string;
  projectName?: string;
  documentDate?: string;
  expiryDate?: string;
  archived?: boolean;
}

// ── Partner ──────────────────────────────────────────────────────────
export interface Partner extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  bankDetails?: string;
  commissionPercentage?: number;
  totalReferrals?: number;
  proposalsSent?: number;
  conversionRate?: number;
}

