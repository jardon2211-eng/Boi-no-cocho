export default function StatCard({
  label,
  value,
  icon,
  sublabel,
  color = "white",
}: {
  label: string;
  value: string;
  icon?: string;
  sublabel?: string;
  color?: "white" | "green" | "orange" | "blue" | "purple";
}) {
  const bg = {
    white: "bg-white",
    green: "bg-green-50",
    orange: "bg-amber-50",
    blue: "bg-blue-50",
    purple: "bg-purple-50",
  }[color];

  return (
    <div className={`${bg} rounded-xl shadow-sm border border-gray-100 p-5 flex items-start justify-between`}>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
      </div>
      {icon && <span className="text-xl">{icon}</span>}
    </div>
  );
}
