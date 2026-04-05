"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(""); // Clear previous errors
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError("Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-4xl mx-auto", className)} {...props}>
      <Card className="overflow-hidden border-border/50 shadow-2xl rounded-3xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 flex flex-col justify-center">
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col items-center text-center mb-2">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Welcome Back</h1>
                <p className="text-muted-foreground font-medium mt-1 text-balance">
                  Log in to your <span className="font-bold text-red-500">Repx</span> account
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 text-red-500 p-3 rounded-xl text-sm font-semibold border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email or Username</Label>
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@example.com"
                  required
                  className="h-12 rounded-xl bg-muted/30 focus-visible:ring-red-500 font-medium"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                  <Link
                    href="#"
                    className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  className="h-12 rounded-xl bg-muted/30 focus-visible:ring-red-500 font-medium"
                />
              </div>

              <Button
                disabled={isLoading}
                type="submit"
                className="h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 transition-transform active:scale-[0.98] mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border my-2">
                <span className="bg-card text-muted-foreground relative z-10 px-4 font-medium uppercase text-xs tracking-widest">
                  Or continue with
                </span>
              </div>

              <Button 
                onClick={handleGoogleSignIn} 
                disabled={isLoading} 
                variant="outline" 
                type="button" 
                className="h-12 rounded-xl font-bold border-border hover:bg-muted transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                </svg>
                Google
              </Button>

              <div className="text-center text-sm font-medium text-muted-foreground mt-4">
                Don&apos;t have an account?{" "}
                <Link href="/sign-up" className="text-foreground font-bold hover:text-red-500 hover:underline transition-colors">
                  Sign up
                </Link>
              </div>
            </div>
          </form>

          {/* Desktop Image Section */}
          <div className="bg-muted relative hidden md:block h-full min-h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-background/80 z-10 mix-blend-multiply" />
            <img
              src="/placeholder.svg"
              alt="Fitness Background"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="text-muted-foreground text-center text-xs text-balance font-medium">
        By clicking continue, you agree to our <Link href="#" className="hover:text-foreground underline underline-offset-4 transition-colors">Terms of Service</Link> and <Link href="#" className="hover:text-foreground underline underline-offset-4 transition-colors">Privacy Policy</Link>.
      </div>
    </div>
  );
}