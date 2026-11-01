export default function StatusBadge({ status }) {
  const styles = {
    APPROVED: "badge-green",
    PENDING: "badge-amber",
    REJECTED: "badge-rose",
    REGISTERED: "badge-green",
    CANCELLED: "badge-slate",
  };
  const labels = {
    APPROVED: "Approved",
    PENDING: "Pending",
    REJECTED: "Rejected",
    REGISTERED: "Registered",
    CANCELLED: "Cancelled",
  };

  return <span className={styles[status] || "badge-slate"}>{labels[status] || status}</span>;
}
