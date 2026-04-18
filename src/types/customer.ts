export type SearchResultRow = {
  id: string;
  status: string;
  loanType: string;
  applicationNumber: string;
  loanNumber: string;
  applyDate: string;
  /** HKID / NRIC / ID as used in discovery brief */
  idNumber: string;
  name: string;
  mobile: string;
  partakerType: string;
  blacklistFlag: boolean;
  /** Business unit / source (company-scoped views) */
  sourceSystem: string;
  /** Age for filter (discovery: age + job filters) */
  age: number;
  job: string;
  /** Company / unit for scoping */
  companyUnit: string;
  passportNumber?: string;
  teRefEnquiry?: string;
  completionChecks?: {
    apply: boolean;
    partakers: boolean;
    credit: boolean;
    income: boolean;
    review: boolean;
  };
};

export type LoanHistoryItem = {
  status: string;
  applyNumber?: string;
  loanNumber: string;
  repaidTenor?: number;
  totalTenor?: number;
  loanAmount?: string;
  instalmentAmount?: string;
  principalBalance?: string;
  interestBalance?: string;
  nextDueDate?: string;
  detailNote?: string;
  product?: string;
  period?: string;
};

export type CreditReferenceItem = {
  creditor: string;
  creditType: string;
  loanAmount: string;
  instalmentAmount: string;
  outstandingTenor: string;
  balanceAmount: string;
  debtor: string;
};

export type CustomerProfile = {
  id: string;
  searchRow: SearchResultRow;
  applyInfo: {
    loanType?: string;
    interestMethod?: string;
    repayCycle?: string;
    loanAmount?: string;
    totalTenor?: string;
    flatRate?: string;
    effectiveRate?: string;
    instalmentAmount?: string;
    maxInterest?: string;
    totalInterest?: string;
    applyDate?: string;
    loanPurpose?: string;
    branch: string;
    staff?: string;
    referralAgent?: string;
    referralAgentAddress?: string;
    relation?: string;
    mainAvenue?: string;
    mainPurpose?: string;
    autopayBankInfo?: string;
    personalInfo?: string;
    status: string;
    notes?: string;
    /** legacy */
    product?: string;
    applicationDate?: string;
    applicantNote?: string;
  };
  partakers: Array<{
    partakerType?: string;
    name: string;
    mobileNo?: string;
    homeNo?: string;
    passport?: string;
    relation?: string;
    selected?: boolean;
    /** legacy */
    relationship?: string;
    contact?: string;
    linkedId?: string;
  }>;
  creditRef: {
    summary: string;
    indicators: string[];
    items?: CreditReferenceItem[];
  };
  documents: Array<{
    type: string;
    date: string;
    reference: string;
  }>;
  mortgage: {
    applicable: boolean;
    assetSummary: string;
    collateralRef: string;
  };
  dsr: {
    income: string;
    expenditure: string;
    ratio: string;
    notes: string;
  };
  loanHistory: LoanHistoryItem[];
  partakingHistory: Array<{
    period: string;
    description: string;
    relatedApplication: string;
  }>;
  approvalInfo: Array<{
    stage: string;
    decision: string;
    notes: string;
    approvalStaff?: string;
    approvalDate?: string;
    payoutDate?: string;
    loanDate?: string;
    firstDueDate?: string;
    firstRepayAmount?: string;
    interestMethod?: string;
    repayCycle?: string;
    loanAmount?: string;
    totalTenor?: string;
    flatRate?: string;
    effectiveRate?: string;
    penaltySetting?: string;
    dsr?: string;
    extendedInterestDay?: string;
    extendedInterestAmount?: string;
    /** legacy */
    date?: string;
    reviewer?: string;
  }>;
  repayHistory: Array<{
    repayDate?: string;
    repayNo?: string;
    repayType?: string;
    tenor?: string;
    repayAmount?: string;
    overdueInterest?: string;
    handlingFee?: string;
    receivedAmount?: string;
    tempAmount?: string;
    remarks?: string;
    /** legacy */
    date?: string;
    amount?: string;
    balanceAfter?: string;
    channel?: string;
  }>;
  repayCondition: {
    terms?: string;
    state: string;
    nextRepayDate?: string;
    nextRepayAmount?: string;
    principalBalance?: string;
    interestBalance?: string;
    feeBalance?: string;
    overdueDays: number;
    collectionNotes: string;
  };
  crm: Array<{ date: string; author: string; note: string }>;
  ocaWriteOff: {
    ocaRecords: string[];
    writeOffRecords: string[];
    recovery: string;
  };
};
