"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      setError(t("error"));
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          #f5f0e8,
          #f5f0e8 1px,
          transparent 1px,
          transparent 60px
        )`
      }} />

      <div className="relative w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent/10 blur-xl" />
            <Image
              src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
              alt="AKV Hyjnesha"
              width={80}
              height={80}
              className="relative rounded-full object-cover border border-border"
            />
          </div>
          <div className="text-center">
            <h1 className="font-playfair text-2xl font-semibold text-foreground">
              AKV &ldquo;<em className="italic">Hyjnesha</em>&rdquo;
            </h1>
            <p className="text-sm text-muted mt-1">{t("subtitle")}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-accent/10 border border-accent/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-playfair text-lg font-semibold text-foreground">{t("checkEmail")}</h2>
              <p className="text-sm text-muted mt-2">{t("checkEmailDesc", { email })}</p>
            </div>
            <button
              onClick={() => setSent(false)}
              className="text-sm text-muted hover:text-foreground transition-colors underline underline-offset-4"
            >
              {t("backToLogin")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t("sending") : t("sendLink")}
            </Button>
          </form>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted/60">
          Ansambli Kulturor Vendor Hyjnesha · Graz
        </p>
      </div>
    </div>
  );
}
