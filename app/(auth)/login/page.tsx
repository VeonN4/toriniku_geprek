"use client";

import { useReducer } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import BrandingPanel from "./BrandingPanel";
import LoginForm from "./LoginForm";

interface LoginState {
  email: string;
  password: string;
  showPassword: boolean;
  error: string;
  loading: boolean;
}

type LoginAction =
  | { type: "SET_EMAIL"; value: string }
  | { type: "SET_PASSWORD"; value: string }
  | { type: "TOGGLE_PASSWORD" }
  | { type: "SET_ERROR"; value: string }
  | { type: "SET_LOADING"; value: boolean }
  | { type: "RESET_ERROR" };

const initialState: LoginState = {
  email: "",
  password: "",
  showPassword: false,
  error: "",
  loading: false,
};

function loginReducer(state: LoginState, action: LoginAction): LoginState {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.value };
    case "SET_PASSWORD":
      return { ...state, password: action.value };
    case "TOGGLE_PASSWORD":
      return { ...state, showPassword: !state.showPassword };
    case "SET_ERROR":
      return { ...state, error: action.value };
    case "SET_LOADING":
      return { ...state, loading: action.value };
    case "RESET_ERROR":
      return { ...state, error: "" };
    default:
      return state;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(loginReducer, initialState);

  const handleLogin = async () => {
    if (!state.email.trim() || !state.password.trim()) {
      dispatch({ type: "SET_ERROR", value: "Email dan password harus diisi" });
      return;
    }
    dispatch({ type: "SET_LOADING", value: true });
    dispatch({ type: "RESET_ERROR" });

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: state.email.trim(),
        password: state.password.trim(),
      });

      if (signInError) {
        dispatch({
          type: "SET_ERROR",
          value: signInError.message || "Email atau password salah",
        });
      } else {
        router.push("/beranda");
        router.refresh();
      }
    } catch {
      dispatch({
        type: "SET_ERROR",
        value: "Terjadi kesalahan sistem. Silakan coba lagi.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", value: false });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex">
      <BrandingPanel />
      <LoginForm
        email={state.email}
        password={state.password}
        showPassword={state.showPassword}
        error={state.error}
        loading={state.loading}
        onEmailChange={(v) => dispatch({ type: "SET_EMAIL", value: v })}
        onPasswordChange={(v) => dispatch({ type: "SET_PASSWORD", value: v })}
        onTogglePassword={() => dispatch({ type: "TOGGLE_PASSWORD" })}
        onSubmit={handleLogin}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
