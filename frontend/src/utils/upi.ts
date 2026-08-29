export function buildUpiLink(
  upiId: string | { upiId?: string; payeeName?: string; amount?: number; note?: string },
  payeeName?: string,
  amount?: number,
  note = "Sadasya Nondani"
): string {
  let id = "";
  let name = "";
  let amtVal = 0;
  let noteVal = note;

  if (typeof upiId === "object" && upiId !== null) {
    id = upiId.upiId || "";
    name = upiId.payeeName || "";
    amtVal = typeof upiId.amount === "number" ? upiId.amount : Number(upiId.amount || 0);
    noteVal = upiId.note || note;
  } else {
    id = upiId || "";
    name = payeeName || "";
    amtVal = typeof amount === "number" ? amount : Number(amount || 0);
  }

  const formattedAmount = isNaN(amtVal) ? "0.00" : amtVal.toFixed(2);

  const params = new URLSearchParams({
    pa: id,
    pn: name,
    am: formattedAmount,
    cu: "INR",
    tn: noteVal,
  });
  return `upi://pay?${params.toString()}`;
}

