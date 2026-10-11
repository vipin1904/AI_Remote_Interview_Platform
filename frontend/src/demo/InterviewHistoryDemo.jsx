const sessions = [
  { id: 1, topic: "Data Structures", date: "2026-10-04", score: 85 },
  { id: 2, topic: "System Design", date: "2026-10-06", score: 78 },
  { id: 3, topic: "JavaScript", date: "2026-10-08", score: 91 },
];

export default function InterviewHistoryDemo() {
  return (
    <section className="mx-auto max-w-5xl space-y-5 p-6">
      <p className="text-sm text-amber-600">DEMO DATA</p>
      <h1 className="text-3xl font-bold">Interview History</h1>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-4">Interview</th>
              <th className="p-4">Date</th>
              <th className="p-4">Score</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-t">
                <td className="p-4">{session.topic}</td>
                <td className="p-4">{session.date}</td>
                <td className="p-4">{session.score}%</td>
                <td className="p-4">Sample</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        Illustrative records only; no interview records are fetched.
      </p>
    </section>
  );
}