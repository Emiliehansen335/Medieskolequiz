import React from "react";
import "./App.css";
import "./Quiz.css";
import "./index.css";
import Quiz from "./components/quiz";
import Login from "./components/login/Login";
import { useAuthContext } from "./components/context/AuthContext";

export default function App() {
  const { signedIn, user, signOut } = useAuthContext();

  if (!signedIn) {
    return <Login />;
  }

  return (
    <div className="app">
      <h1>Velkommen {user?.name || "Bruger"} til Media College Viborg Quiz</h1>
      <button onClick={signOut}>Log ud</button>
      <img src="src\black.png" alt="" />
      <Quiz />
    </div>
  );
}
