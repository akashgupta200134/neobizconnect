export type LedgerEntry = {
  Origin: string;
  OriginDocEntry: string;
  Ref3: string;
  OriginNo: string;
  CreditLC: number;
  OffsetAccount: string;
  Details: string;
  DebitLC: number;
  PostingDate: string;
  CumulativeBalanceLC: number;
  Branch: string;
  Ref1: string;
  Ref2: string;
  BalanceDueLC: number;
};

export type CustomerLedgerResponse = {
  TotalDebitLC: number;
  CardName: string;
  TotalCumulativeBalanceLC: number;
  AccountBalance: LedgerEntry[];
  CardCode: string;
  AccBalance: string;
  TotalBalanceDueLC: number;
  TotalCreditLC: number;
};
