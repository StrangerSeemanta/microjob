interface StatusBadgeProps {
  status: "pending" | "paid" | "rejected";
}

const statusConfig = {
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-800 border border-yellow-300",
  },

  paid: {
    label: "Paid",
    className:
      "bg-green-100 text-green-800 border border-green-300",
  },

  rejected: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-800 border border-red-300",
  },
};

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        ${config.className}
      `}
    >
      {config.label}
    </span>
  );
}