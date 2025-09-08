import React, { useState } from "react";
import { useFetchQuestions } from "../hooks/useFetchQuestions";
import QuestionForm from "./QuestionForm";

const API_URL = "https://quiz-tpjgk.ondigitalocean.app";

const Quiz = () => {
  const { questions, isLoading, error, refetch } = useFetchQuestions();

  const qList = (questions || []).map((q) => ({
    ...q,
    id: q.id ?? q._id, // question id
    correctOptionId: q.correctOptionId ?? q.correct_id,
    options: (q.options || []).map((o) => ({
      ...o,
      id: o.id ?? o._id, // option id
      text: o.text ?? String(o),
    })),
  }));

  const [editId, setEditId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userHasClicked, setUserHasClicked] = useState(false);

  const handleOptionClick = (questionId, optionId) => {
    const question = qList.find((q) => String(q.id) === String(questionId));
    if (!question) {
      console.warn("Question not found for id:", questionId);
      return;
    }
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }));
    setUserHasClicked(true);
  };

  const handleQuestionCreated = () => refetch();

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < qList.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserHasClicked(false);
    } else {
      try {
        // Calculate correct answers count
        const correctCount = Object.keys(selectedOptions).reduce(
          (count, questionId) => {
            const question = qList.find(
              (q) => String(q.id) === String(questionId)
            );
            if (
              question &&
              String(selectedOptions[questionId]) ===
                String(question.correctOptionId)
            ) {
              return count + 1;
            }
            return count;
          },
          
        );

        const response = await fetch(`${API_URL}/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("auth")?.token || ""
            }`,
          },
          body: JSON.stringify({
            correctAnswersCount: correctCount,
          }),
        });
        if (!response.ok) {
          console.error("Failed to send answers");
        } else {
          console.log("Answers sent successfully");
          // Fetch updated user data and log it
          const userResponse = await fetch(`${API_URL}/user`, {
            headers: {
              Authorization: `Bearer ${
                localStorage.getItem("auth")?.token || ""
              }`,
            },
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log("Updated user data:", userData);
          }
        }
      } catch (error) {
        console.error("Error sending answers:", error);
      }
    }
  };

  if (isLoading) return <p>Indlæser...</p>;
  if (error) return <p style={{ color: "black" }}>{error}</p>;

  return (
    <div className="quiz">
      <QuestionForm
        onQuestionCreated={handleQuestionCreated}
        isEditMode={!!editId}
        id={editId}
      />

      <ul>
        {qList && qList.length > 0 ? (
          <div>
            <b>{qList[currentQuestionIndex].question}</b>

            {qList[currentQuestionIndex].options.map((opt, index) => {
              const q = qList[currentQuestionIndex];
              const selectedOptionId = selectedOptions[q.id];
              const isSelected = String(selectedOptionId) === String(opt.id);
              const isCorrect = String(opt.id) === String(q.correctOptionId);

              return (
                <ul
                  key={index}
                  onClick={() => {
                    if (!selectedOptionId) {
                      handleOptionClick(q.id, opt.id);
                      setUserHasClicked(true);
                    }
                  }}
                  className={`option ${
                    userHasClicked && isSelected
                      ? isCorrect
                        ? "correct"
                        : "incorrect"
                      : ""
                  }`}
                >
                  {opt.text}
                </ul>
              );
            })}

            {userHasClicked && (
              <p>
                {String(selectedOptions[qList[currentQuestionIndex].id]) ===
                String(qList[currentQuestionIndex].correctOptionId)
                  ? "Svaret er rigtigt!"
                  : `Forkert svar. Korrekt svar er: ${
                      qList[currentQuestionIndex].options.find(
                        (o) =>
                          String(o.id) ===
                          String(qList[currentQuestionIndex].correctOptionId)
                      )?.text || ""
                    }`}
              </p>
            )}

            <button onClick={handleNextQuestion}>
              {Object.keys(selectedOptions).length === qList.length
                ? "Gå til biblioteket"
                : "Næste spørgsmål"}
            </button>
          </div>
        ) : (
          <li>Ingen quizzer fundet.</li>
        )}
      </ul>
    </div>
  );
};

export default Quiz;
