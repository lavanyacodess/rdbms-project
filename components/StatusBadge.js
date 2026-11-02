export default function StatusBadge({ status }) {
  const styles = {
    APPROVED: "stamp stamp-green",
    PENDING: "stamp stamp-amber",
    REJECTED: "stamp stamp-red",
    REGISTERED: "stamp stamp-green",
    CANCELLED: "stamp stamp-muted",
  };
  const labels = {
    APPROVED: "Approved",
    PENDING: "Pending",
    REJECTED: "Rejected",
    REGISTERED: "Registered",
    CANCELLED: "Cancelled",
  };

  return <span className={styles[status] || "stamp stamp-muted"}>{labels[status] || status}</span>;
}
