import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/sign-in";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { useSession } from "~/contexts/session-context";
import { usePreSession, useSignIn } from "~/hooks/use-auth";

const formSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Page() {
  const { refreshSession, csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  const preSessionMutation = usePreSession();
  const signInMutation = useSignIn();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, isLoading, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { setError } = form;

  // Create pre-session on mount if no CSRF token exists
  useEffect(() => {
    if (!csrfToken && !preSessionMutation.isPending) {
      preSessionMutation.mutate();
    }
  }, [csrfToken, preSessionMutation]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const tokenToUse = csrfToken || preSessionMutation.data;

    if (!tokenToUse) {
      setError("root", {
        message: "No CSRF token available. Please try again.",
      });
      return;
    }

    try {
      await signInMutation.mutateAsync({
        username: values.username,
        password: values.password,
        csrfToken: tokenToUse,
      });

      // Refresh session to load user data and CSRF token
      await refreshSession();
      navigate("/home");
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "Sign in failed",
      });
    }
  }

  const isSubmitting = signInMutation.isPending;
  const errors = form.formState.errors;

  return (
    <>
      <title>Sign In | Issho</title>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sign in to your account</CardTitle>
                <CardDescription>
                  Enter your credentials below to sign in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="your_username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="yourVerySecureP@ssw0rd!"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      Submit
                    </Button>
                    {errors.root?.message && !isSubmitting && (
                      <div className="text-destructive text-sm text-center">
                        {errors.root?.message}
                      </div>
                    )}
                    <div className="mt-4 text-center text-sm">
                      Don&apos;t have an account?{" "}
                      <Link
                        to="/auth/sign-up"
                        className="underline underline-offset-4"
                      >
                        Sign up
                      </Link>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
