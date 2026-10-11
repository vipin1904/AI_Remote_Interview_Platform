const stats = [
  { label: "Interviews Completed", value: 12 },
  { label: "Average Score", value: "82%" },
  { label: "Upcoming Interviews", value: 3 },
];

export default function CandidateDashboardDemo() {
  return (
    <section className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <p className="text-sm text-amber-600">DEMO DATA</p>
        <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
        <p className="text-gray-500">
          Track your interview preparation progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-xl border p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border p-5">
        <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
        <p className="mt-3">DSA Mock Interview — Sample session</p>
        <p className="text-sm text-gray-500">
          Static preview; scheduling is not connected.
        </p>
      </div>
    </section>
  );
}
