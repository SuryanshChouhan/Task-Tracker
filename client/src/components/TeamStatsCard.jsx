export default function TeamStatsCard({ title, value }) {
  return (
    <div className="card-glass rounded-2xl p-5 shadow-lg">
      <p className="text-xs uppercase tracking-wide text-slate">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}
