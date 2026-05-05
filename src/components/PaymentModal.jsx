import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function PaymentModal({
  renterId,
  month,
  year,
  existingPayment,
  defaultRent,
  onClose,
  onSaved,
}) {
  const [amount, setAmount] = useState(existingPayment?.amount_received || defaultRent || 0);
  const [isPaid, setIsPaid] = useState(existingPayment?.is_paid || false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);

    const payload = {
      renter_id: renterId,
      month,
      year,
      amount_received: amount,
      is_paid: isPaid,
      payment_date: isPaid ? new Date().toISOString() : null,
    };

    let error;

    if (existingPayment) {
      ({ error } = await supabase
        .from("payments")
        .update(payload)
        .eq("id", existingPayment.id));
    } else {
      ({ error } = await supabase.from("payments").insert(payload));
    }

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    onSaved();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Payment - {month}/{year}</h2>

        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
            />
            Mark as Paid
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}