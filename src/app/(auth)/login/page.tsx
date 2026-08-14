"use client";

import { useState } from "react";
import { signIn, signUp } from "@/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Warehouse,
  Package,
  TrendingUp,
  ArrowRightLeft,
} from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinMode, setJoinMode] = useState<"create" | "join">("create");

  async function handleSignIn(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleSignUp(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 animate-fade-in">
      {/* Left side — Branding */}
      <div className="hidden lg:flex flex-col justify-center space-y-8 p-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Package className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Punch Logistics
            </h1>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A centralized B2B system for managing inventory, deliveries, and
            financial operations across your business.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              icon: Warehouse,
              title: "Multi-Warehouse Inventory",
              desc: "Track stock levels across all your locations in real-time",
            },
            {
              icon: ArrowRightLeft,
              title: "Procurement & Deliveries",
              desc: "Manage inbound purchases and outbound client deliveries",
            },
            {
              icon: TrendingUp,
              title: "Financial Dashboard",
              desc: "Monitor debt, collectibles, cash flow, and expenses at a glance",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-lg border border-border/50 bg-card/50 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{feature.title}</p>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side — Auth form */}
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-1">
            <div className="flex justify-center lg:hidden mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Package className="h-7 w-7" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" id="signin-tab">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" id="signup-tab">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <GoogleAuthButton />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Sign In */}
              <TabsContent value="signin">
                <form action={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    id="signin-button"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up */}
              <TabsContent value="signup">
                <form action={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>

                  {/* Toggle: Create Company vs Join */}
                  <div className="flex gap-2 rounded-lg bg-muted p-1">
                    <button
                      type="button"
                      onClick={() => setJoinMode("create")}
                      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        joinMode === "create"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Create Company
                    </button>
                    <button
                      type="button"
                      onClick={() => setJoinMode("join")}
                      className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        joinMode === "join"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Join Team
                    </button>
                  </div>

                  {joinMode === "create" ? (
                    <div className="space-y-2">
                      <Label htmlFor="signup-company">Company Name</Label>
                      <Input
                        id="signup-company"
                        name="companyName"
                        type="text"
                        placeholder="Acme Corporation"
                        required
                      />
                      <input type="hidden" name="inviteCode" value="" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="signup-invite">Invite Code</Label>
                      <Input
                        id="signup-invite"
                        name="inviteCode"
                        type="text"
                        placeholder="ABCD1234"
                        className="uppercase tracking-widest"
                        maxLength={8}
                        required
                      />
                      <input type="hidden" name="companyName" value="" />
                      <p className="text-xs text-muted-foreground">
                        Ask your team owner for the 8-character invite code
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    id="signup-button"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function GoogleAuthButton() {
  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });
  };

  return (
    <Button 
      type="button" 
      onClick={handleGoogleLogin}
      variant="outline" 
      className="w-full flex items-center justify-center gap-2 border-border/40 bg-background/50 hover:bg-accent"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
  );
}
