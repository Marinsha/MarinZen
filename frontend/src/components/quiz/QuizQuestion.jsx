import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { QUIZ_QUESTION_CONFIG } from "@/constants/doshaData";

const QuizQuestion = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrev,
}) => {
  const { t } = useTranslation();

  if (!question) {
    return (
      <div className="w-full max-w-2xl mx-auto px-2">
        <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl shadow-lg p-6 sm:p-8 text-center text-zinc-600 dark:text-stone-400">
          {t("discover.quiz.loading", "Loading question...")}
        </div>
      </div>
    );
  }

  const progressValue = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const isFirst = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
      <div className="bg-white/90 dark:bg-white/5 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden transition-colors duration-300">
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold tracking-widest uppercase text-zinc-500 dark:text-stone-500">
              {t("discover.quiz.question_label", "Question")}
            </span>
            <span className="text-xs font-bold text-zinc-600 dark:text-stone-400 tabular-nums">
              {currentQuestionIndex + 1}
              <span className="text-zinc-400 dark:text-stone-600">
                {" "}
                / {totalQuestions}
              </span>
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <div className="px-5 sm:px-8 pb-5 sm:pb-6">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full border border-amber-200 dark:border-amber-700/50 mb-3 sm:mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {question.question}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-stone-100 leading-snug">
            {t("discover.quiz.which_best", "Which best describes your")}{" "}
            <span className="text-amber-600 dark:text-amber-400">
              {question.question?.toLowerCase()}
            </span>
            ?
          </h2>
        </div>

        <div className="px-5 sm:px-8 pb-5 sm:pb-6 space-y-2 sm:space-y-3">
          {question.options.map((option, index) => {
            const doshaKey = option.dosha ? option.dosha.toLowerCase() : "";
            const dosha = QUIZ_QUESTION_CONFIG[doshaKey];
            const isSelected = selectedAnswer === doshaKey;
            return (
              <button
                key={option.key || index}
                onClick={() => onAnswerSelect(doshaKey)}
                className={`group w-full text-left rounded-xl sm:rounded-2xl border-2 px-4 sm:px-5 py-3 sm:py-4 flex items-start gap-3 sm:gap-4 transition-all duration-200
                  ${
                    isSelected && dosha
                      ? `${dosha.border} ${dosha.bg} ring-2 ${dosha.ring}/40 shadow-md`
                      : isSelected
                        ? "border-zinc-500 bg-zinc-100 ring-2 ring-zinc-500/40 shadow-md"
                        : "border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-sm"
                  }`}
              >
                <div
                  className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                  ${isSelected && dosha ? `${dosha.border} ${dosha.dot}` : isSelected ? "border-zinc-500 bg-zinc-500" : "border-zinc-300 dark:border-stone-600"}`}
                >
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-relaxed transition-colors duration-200 ${isSelected && dosha ? `${dosha.text} font-medium` : "text-zinc-700 dark:text-stone-400"}`}
                  >
                    {option.text}
                  </p>
                  {isSelected && dosha && (
                    <span
                      className={`inline-block mt-1.5 text-xs font-semibold tracking-wide ${dosha.text}`}
                    >
                      {dosha.icon}{" "}
                      {t(
                        `doshas.${doshaKey}`,
                        doshaKey.charAt(0).toUpperCase() + doshaKey.slice(1),
                      )}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-5 sm:px-8 pb-6 sm:pb-8 mt-2 flex w-full items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={isFirst}
            className="flex items-center gap-2 h-10 sm:h-11 px-3 sm:px-4 rounded-xl border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-stone-400 hover:bg-zinc-50 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-stone-200 disabled:opacity-30 transition-all duration-200 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden xs:inline">
              {t("discover.quiz.previous", "Previous")}
            </span>
          </Button>
          <Button
            onClick={onNext}
            disabled={!selectedAnswer}
            className="flex items-center gap-2 h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md shadow-orange-200/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-100 border-0 text-sm"
          >
            {isLast
              ? t("discover.quiz.see_result", "See My Result")
              : t("discover.quiz.next_question", "Next")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestion;
