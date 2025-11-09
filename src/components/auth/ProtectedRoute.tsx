// src/components/auth/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export const ProtectedRoute = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    // You can replace this with a fancy spinner if you want
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Not logged in, redirect to AuthPage
    return <Navigate to="/" replace />;
  }

  // Logged in, render the protected content
  return <Outlet />;
};
