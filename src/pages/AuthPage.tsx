// src/pages/AuthPage.tsx
import React, { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-white via-purple-200 to-purple-800 mobile-container">
      <div className="w-full max-w-md mx-auto">
        {isLogin ? (
          <LoginForm onToggleForm={() => setIsLogin(false)} />
        ) : (
          <SignUpForm onToggleForm={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}
