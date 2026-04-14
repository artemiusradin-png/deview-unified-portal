/** Condensed from Project_1_questions_for_development — guides UI + assistant behavior. */
export const DISCOVERY_BRIEF = `
deviewai.com unified portal (client discovery brief):
- Search: HKID/ID number, phone, or name; combined results from all internal sources; no match → show no result.
- Profile: single merged borrower view; lender sections include apply/identity, partakers, credit, documents, financials (DSR), loan history, partaking history, approval, repay history & condition, OCA/write-off. Client labels sections A,B,C,F plus loan/partaking/approval/repay modules.
- Filters (staff): age and job; combine multiple filters; data scoped to employee’s company/unit where applicable.
- Privacy: phone may show only first digits in summaries; company IP / fixed IP access in production.
- Assistant/chatbot: answer from internal unified database; typical questions — is this HKID in our files, which company they borrow with, repayment history, borrowing status; summarize insights from data; no chat logs required per brief.
- Updates: at least every working day; mobile and desktop.
`.trim();
