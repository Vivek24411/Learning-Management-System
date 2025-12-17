export default function QuestionCard({ question, index, selected, onSelect, submitted }) {
  // question.options now expected as an array of simple objects or strings.
  // QuizEngine passes options as [{ text, originalIndex }, ...] — handle both.

  const getOptText = (opt) => (typeof opt === "string" ? opt : opt.text ?? "");

  return (
    <div className="space-y-3">
      <p className="text-gray-200 font-medium text-sm">
        {index + 1}. {question.text || question.question || ""}
      </p>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          // selected is the selected index for this question (0..n-1)
          const isSelected = selected === i;
          const isCorrect = question.correctIndex === i;

          let base =
            "w-full text-left px-4 py-3 rounded text-sm transition duration-150 border";

          if (!submitted) {
            base += isSelected
              ? " bg-indigo-600 border-indigo-500 text-white"
              : " bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700";
          } else {
            if (isCorrect) base += " bg-green-600 border-green-500 text-white";
            else if (isSelected && !isCorrect) base += " bg-red-600 border-red-500 text-white";
            else base += " bg-gray-800 border-gray-700 text-gray-400";
          }

          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => onSelect(question.id, i)}
              className={base}
            >
              {getOptText(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
