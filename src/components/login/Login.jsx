import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuthContext } from "../context/AuthContext";
import styles from "./login.module.css";

const schema = yup.object({
  name: yup.string(),
});

const Login = () => {
  const { signIn, error } = useAuthContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const success = await signIn(data.name ? data.name.trim() : "");
      if (success) {
        navigate("/");
      } else {
        setError("root", { message: "Login fejlede" });
      }
    } catch (err) {
      setError("root", { message: "Login fejlede" });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <label className={styles.label}>
        Navn (valgfrit):
        <input className={styles.input} type="text" {...register("name")} />
        {errors.name && (
          <span className={styles.error}>{errors.name.message}</span>
        )}
      </label>
      <button className={styles.button} type="submit">
        Log ind
      </button>
      {error && <span className={styles.error}>{error}</span>}
    </form>
  );
};

export default Login;
