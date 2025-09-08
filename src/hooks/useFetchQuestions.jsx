import { useEffect, useState } from "react";

const API_URL = "https://quiz-tpjgk.ondigitalocean.app";

const useFetchQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get all quizzes
  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/quiz`);
      if (!response.ok) {
        setError(`Fejl: ${response.status} ${response.statusText}`);
        setQuestions([]);
        return;
      }
      const data = await response.json();
      const allQuizzes = (Array.isArray(data) ? data : data.data || []).map(
        (q) => ({
          question: q.question || "",
          options: Array.isArray(q.options)
            ? q.options.map((opt, idx) =>
                typeof opt === "object"
                  ? opt
                  : { id: String(idx), text: String(opt) }
              )
            : [],
          correctOptionId: q.correctOptionId || "",
          id: q.id || q._id || "",
        })
      );
      // Filter to only the specific questions
      const specificIds = [
        "68be9e3e6e35789ca4cd233a",
        "68be9fd96e35789ca4cd2376",
      ];
      const filteredQuizzes = allQuizzes.filter((q) =>
        specificIds.includes(q.id)
      );
      setQuestions(filteredQuizzes);
      setError(null);
    } catch (error) {
      setError("Netværksfejl: " + error.message);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get quiz by ID
  const fetchQuestionById = async (id) => {
    try {
      const response = await fetch(`${API_URL}/quiz/${id}`);
      const data = await response.json();
      // Sikrer at enkelt quiz har question, options og correctAnswer
      const q = data.data || data;
      return {
        question: q.question || "",
        options: q.options || [],
        correctOptionId: q.correctOptionId || "",
        id: q.id || q._id || "",
      };
    } catch (error) {
      console.log("fejl", error);
    }
  };

  // Refetch
  const refetch = () => {
    fetchQuestions();
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return {
    questions,
    fetchQuestionById,
    refetch,
    error,
    isLoading,
  };
};

export { useFetchQuestions };
