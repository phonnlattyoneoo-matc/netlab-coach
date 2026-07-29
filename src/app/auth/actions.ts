"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type MessageType = "error" | "success";

function redirectWithMessage(
  path: string,
  type: MessageType,
  message: string,
): never {
  const searchParams = new URLSearchParams({
    [type]: message,
  });

  redirect(`${path}?${searchParams.toString()}`);
}

function getCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    email.trim().length === 0 ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    return null;
  }

  return {
    email: email.trim(),
    password,
  };
}

export async function signUp(formData: FormData) {
  const credentials = getCredentials(formData);

  if (!credentials) {
    redirectWithMessage(
      "/auth/sign-up",
      "error",
      "Email and password are required.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(credentials);

  if (error) {
    redirectWithMessage(
      "/auth/sign-up",
      "error",
      "Unable to create your account. Check your details and try again.",
    );
  }

  redirectWithMessage(
    "/auth/login",
    "success",
    "Account created. Check your email if confirmation is required, then log in.",
  );
}

export async function login(formData: FormData) {
  const credentials = getCredentials(formData);

  if (!credentials) {
    redirectWithMessage(
      "/auth/login",
      "error",
      "Email and password are required.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    redirectWithMessage(
      "/auth/login",
      "error",
      "Invalid email or password.",
    );
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({
    scope: "local",
  });

  if (error) {
    redirectWithMessage(
      "/auth/login",
      "error",
      "Unable to log out. Please try again.",
    );
  }

  revalidatePath("/", "layout");
  redirectWithMessage("/auth/login", "success", "You have been logged out.");
}
