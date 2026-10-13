import { useState } from "react";

export default function FeedbackPanelDemo() {
  const [rating, setRating] = useState("4");
  const [comments, setComments] = useState("");

  return (
    <section className="mx-auto max-w-2xl space-y-5 p-6">
      <p className="text-sm text-amber-600">DEMO — NOT SUBMITTED</p>
      <h1 className="text-3xl font-bold">Interview Feedback</h1>
      <p className="text-gray-500">
        Preview the feedback form for an interview session.
      </p>

      <form
        className="space-y-4 rounded-xl border p-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <div>
          <label className="mb-2 block font-medium">
            Communication rating
          </label>
          <select
            className="w-full rounded-lg border p-3"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
          >
            <option value="1">1 — Needs improvement</option>
            <option value="2">2 — Fair</option>
            <option value="3">3 — Good</option>
            <option value="4">4 — Very good</option>
            <option value="5">5 — Excellent</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">Comments</label>
          <textarea
            className="w-full rounded-lg border p-3"
            rows={4}
            value={comments}
            onChange={(event) => setComments(event.target.value)}
            placeholder="Enter sample feedback..."
          />
        </div>

        <button
          type="button"
          className="rounded-lg bg-gray-800 px-5 py-3 text-white"
          onClick={() =>
            alert(`Demo only — rating ${rating}/5; nothing was submitted.`)
          }
        >
          Preview Feedback
        </button>
      </form>
    </section>
  );
}