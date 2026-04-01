"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, phone: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Pick<Profile, "name" | "phone">>) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
  fetchAddresses: () => Promise<SavedAddress[]>;
  addAddress: (label: string, address: string) => Promise<string | null>;
  updateAddress: (id: string, label: string, address: string) => Promise<string | null>;
  deleteAddress: (id: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle failed token refresh
        if (event === "TOKEN_REFRESHED" && !session) {
          await supabase.auth.signOut();
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        const u = session?.user ?? null;
        setUser(u);

        if (u) {
          // Set provisional profile from auth metadata immediately so the
          // account page never stalls waiting for the DB round-trip.
          setProfile({
            id: u.id,
            name: u.user_metadata?.name ?? "",
            email: u.email ?? "",
            phone: u.user_metadata?.phone ?? undefined,
          });
        } else {
          setProfile(null);
        }

        // Unblock the UI on every event — once any auth event fires we know
        // the current state. Waiting only for INITIAL_SESSION is fragile
        // because Supabase emits it only after an async token-refresh check.
        setLoading(false);

        // Fetch full profile from DB after unblocking the UI
        if (u) {
          const full = await fetchProfile(u.id);
          if (full) setProfile(full);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  const signUp = async (name: string, email: string, phone: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });
    return error ? error.message : null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`,
    });
    return error ? error.message : null;
  };

  const updateProfile = async (data: Partial<Pick<Profile, "name" | "phone">>): Promise<string | null> => {
    if (!user) return "Not authenticated";
    const { error } = await supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) return error.message;
    setProfile((prev) => prev ? { ...prev, ...data } : prev);
    return null;
  };

  const refreshProfile = async () => {
    if (!user) return;
    setProfile(await fetchProfile(user.id));
  };

  const fetchAddresses = async (): Promise<SavedAddress[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error || !data) return [];
    return data as SavedAddress[];
  };

  const addAddress = async (label: string, address: string): Promise<string | null> => {
    if (!user) return "Not authenticated";
    const { error } = await supabase
      .from("user_addresses")
      .insert({ user_id: user.id, label, address });
    return error ? error.message : null;
  };

  const updateAddress = async (id: string, label: string, address: string): Promise<string | null> => {
    if (!user) return "Not authenticated";
    const { error } = await supabase
      .from("user_addresses")
      .update({ label, address })
      .eq("id", id)
      .eq("user_id", user.id);
    return error ? error.message : null;
  };

  const deleteAddress = async (id: string): Promise<string | null> => {
    if (!user) return "Not authenticated";
    const { error } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    return error ? error.message : null;
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signIn, signUp, signOut,
      updateProfile, refreshProfile, resetPassword,
      fetchAddresses, addAddress, updateAddress, deleteAddress,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
