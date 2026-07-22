import React from "react";
import { motion } from "framer-motion";

// Renders a completed quiz attempt: each question with its four options,
// marking the option the learner chose and the correct one.
// `review` items: { question, options:{1,2,3,4}, correct, chosen, isCorrect }
const QuizReview = ({ review }) => {
  if (!review || review.length === 0) {
    return (
      <p className="text-sm text-ink-muted py-2">
        No answer details were recorded for this attempt.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {review.map((q, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.03 }}
          className="bg-surface border border-border rounded-lg p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <p className="font-medium text-ink text-sm leading-relaxed">
              <span className="text-ink-muted mr-1">Q{i + 1}.</span>
              {q.question}
            </p>
            <span
              className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                q.isCorrect
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {q.isCorrect ? "Correct" : "Incorrect"}
            </span>
          </div>

          <div className="space-y-2">
            {[1, 2, 3, 4].map((n) => {
              const isCorrect = q.correct === n;
              const isChosen = q.chosen === n;
              let cls =
                "border-border bg-bg text-ink-muted"; // neutral
              if (isCorrect)
                cls = "border-success/40 bg-success/10 text-ink";
              else if (isChosen)
                cls = "border-danger/40 bg-danger/10 text-ink";

              return (
                <div
                  key={n}
                  className={`flex items-center gap-3 rounded-md border px-3 py-2 text-sm ${cls}`}
                >
                  <span className="w-5 h-5 shrink-0 flex items-center justify-center rounded-full border border-current text-[11px] font-semibold">
                    {String.fromCharCode(64 + n)}
                  </span>
                  <span className="flex-1">{q.options[n]}</span>
                  {isCorrect && (
                    <span className="text-success text-xs font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Correct answer
                    </span>
                  )}
                  {isChosen && !isCorrect && (
                    <span className="text-danger text-xs font-semibold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Your choice
                    </span>
                  )}
                  {isChosen && isCorrect && (
                    <span className="text-success text-xs font-semibold">Your choice</span>
                  )}
                </div>
              );
            })}
          </div>

          {(q.chosen === null || q.chosen === undefined) && (
            <p className="text-xs text-ink-muted mt-2 italic">Not answered</p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default QuizReview;
