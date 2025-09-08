import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useFetchQuestions } from "../hooks/useFetchQuestions";

const QuestionForm = ({ onQuestionCreated, isEditMode, id }) => {
  const { createQuestion, updateQuestion, fetchQuestionById } =
    useFetchQuestions();
  const { register, handleSubmit, setValue, getValues } = useForm();

  // Hent eksisterende data ved redigering
  useEffect(() => {
    if (isEditMode && id) {
      const loadQuestionData = async () => {
        try {
          const response = await fetchQuestionById(id);
          if (response) {
            setValue("question", response.question);
            setValue(
              "options",
              response.options ? response.options.join(", ") : ""
            );
            setValue("correctAnswer", response.correctAnswer);
          }
        } catch (error) {
          console.error("Error fetching question:", error);
        }
      };
      loadQuestionData();
    }
  }, [id, isEditMode, setValue, fetchQuestionById]);

  const onSubmit = async (data) => {
    const questionData = {
      question: data.question,
      options: data.options.split(",").map((opt) => opt.trim()),
      correctOptionId: data.correctOptionId,
    };

    try {
      let response;
      if (isEditMode && id) {
        response = await updateQuestion({ ...questionData, id });
      } else {
        response = await createQuestion(questionData);
      }

      if (response && onQuestionCreated) {
        onQuestionCreated();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isEditMode && id && (
        <div>
          <div>
            <strong>Muligheder:</strong>{" "}
            {typeof getValues === "function" ? getValues("options") : ""}
          </div>
          <div>
            <strong>Korrekt svar:</strong>{" "}
            {typeof getValues === "function"
              ? getValues("correctOptionId")
              : ""}
          </div>
        </div>
      )}
    </form>
  );
};

export default QuestionForm;
