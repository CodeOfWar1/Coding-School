import React, { createContext, use, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // merged user + profile
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------
  // Fetch profile and merge with auth user
  // --------------------------------------------------------
  const loadUserWithProfile = async (authUser, session) => {
    if (!authUser) {
      setUser(null);
      setSession(null);
      return;
    }

    let profile = null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle(); // 👈 IMPORTANT

      if (!error) {
        profile = data;
      }
    } catch (err) {
      console.error("Profile fetch failed:", err);
    }

    // AUTH MUST ALWAYS SET USER
    setUser({
      ...authUser,
      profile, // null is OK
    });

    setSession(session);
  };

  // --------------------------------------------------------
  // Listen to auth changes
  // --------------------------------------------------------
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      await loadUserWithProfile(session?.user ?? null, session);
      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserWithProfile(session?.user ?? null, session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --------------------------------------------------------
  // Sign out
  // --------------------------------------------------------
  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const value = {
    user,       // auth user + profile
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// --------------------------------------------------------
// Hook
// --------------------------------------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
