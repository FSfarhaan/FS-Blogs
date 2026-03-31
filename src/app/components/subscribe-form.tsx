"use client";

import { FormEvent, useState } from "react";

type Props = {
  compact?: boolean;
};

type Status = {
  tone: "idle" | "success" | "error";
  message: string;
};

const idleState: Status = {
  tone: "idle",
  message: "",
};

export function SubscribeForm({ compact = false }: Props) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(idleState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(idleState);

    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: data.error ?? "Subscription failed. Please try again.",
        });
        return;
      }

      setEmail("");
      setStatus({
        tone: "success",
        message: data.message ?? "You are subscribed.",
      });
    } catch {
      setStatus({
        tone: "error",
        message: "Something went wrong while saving your email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-4 ${compact ? "" : "rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]"}`}
    >
      <div className={compact ? "flex flex-col gap-3 sm:flex-row" : "flex flex-col gap-3"}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          className="h-14 w-full rounded-full border border-[var(--border)] bg-white px-5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-14 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </button>
      </div>

      <p
        className={`text-sm ${
          status.tone === "error"
            ? "text-red-600"
            : status.tone === "success"
              ? "text-emerald-600"
              : "text-[var(--muted)]"
        }`}
      >
        {status.message || "One email when a new article is published. No spam."}
      </p>
    </form>
  );
}
