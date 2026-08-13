export function buildUpiLink(
  upiId: string,
  payeeName: string,
  amount: number,
  note = "Sadasya Nondani"
): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}
