export type SearchResultRow = {
  id: string;
  status: string;
  loanType: string;
  applicationNumber: string;
  loanNumber: string;
  applyDate: string;
  idNumber: string;
  name: string;
  mobile: string;
  partakerType: string;
  blacklistFlag: boolean;
  sourceSystem: string;
};

export type CustomerProfile = {
  id: string;
  searchRow: SearchResultRow;
  applyInfo: {
    product: string;
    branch: string;
    applicationDate: string;
    status: string;
    applicantNote: string;
  };
  partakers: Array<{
    name: string;
    relationship: string;
    contact: string;
    linkedId?: string;
  }>;
  creditRef: { summary: string; indicators: string[] };
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
  loanHistory: Array<{
    loanNumber: string;
    product: string;
    status: string;
    period: string;
  }>;
  partakingHistory: Array<{
    period: string;
    description: string;
    relatedApplication: string;
  }>;
  approvalInfo: Array<{
    stage: string;
    date: string;
    reviewer: string;
    decision: string;
    notes: string;
  }>;
  repayHistory: Array<{
    date: string;
    amount: string;
    balanceAfter: string;
    channel: string;
  }>;
  repayCondition: {
    terms: string;
    state: string;
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
