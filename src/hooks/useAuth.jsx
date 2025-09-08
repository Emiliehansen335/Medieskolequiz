import { jwtDecode } from "jwt-decode";
// filepath: c:\Users\emili\Desktop\quizmappen\Quizfrontend\src\hooks\useAuth.jsx
import { useState } from "react";
import useLocalStorage from "./useLocalStorage";

const useAuth = () => {
  const [error, setError] = useState("");
  const [user, setUser] = useLocalStorage("user", {});
  const [auth, setAuth] = useLocalStorage("auth", {});
  const signedIn = !!auth.token;

  const signIn = async (name = "") => {
    try {
      const response = await fetch(
        "https://quiz-tpjgk.ondigitalocean.app/user",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        setError("Login fejlede. Prøv igen.");
        return false;
      }

      let result;
      try {
        const text = await response.text();
        if (text.trim() === "") {
          result = { data: { token: "dummy", user: { name: name } } };
        } else {
          result = JSON.parse(text);
        }
      } catch (err) {
        result = { data: { token: "dummy", user: { name: name } } };
      }
      setAuth({ token: result.data.token || "dummy" });
      const token = result.data.token;
      let userData = result.data.user || result.data;
      if (!userData && token) {
        try {
          if (typeof token === "string") {
            userData = jwtDecode(token);
          } else {
            userData = {};
          }
        } catch (err) {
          userData = {};
        }
      }
      // Use the entered name if provided
      if (userData && name) {
        userData.name = name;
      }
      setUser(userData);
      console.log("Bruger logget ind!");
      return true;
    } catch (err) {
      setError(err.message || "Noget gik galt. Prøv igen.");
      return false;
    }
  };

  const signOut = () => {
    setAuth({});
    setUser({});
  };

  const token = auth.token ? auth.token : "";

  return {
    error,
    signIn,
    signOut,
    token,
    signedIn,
    user,
  };
};

export default useAuth;
