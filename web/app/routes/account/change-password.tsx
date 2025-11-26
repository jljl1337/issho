import { useEffect } from "react";
import { redirect, useNavigate } from "react-router";
import type { Route } from "./+types/change-password";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

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
import { updatePassword } from "~/lib/db/users";
import { updatePasswordSchema } from "~/lib/schemas/auth";

export default function Page() {
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    setError,
    formState: { isSubmitting, errors },
  } = form;

  async function onSubmit(values: z.infer<typeof updatePasswordSchema>) {
    if (!csrfToken) {
      setError("root", {
        message: "No CSRF token available",
      });
      return;
    }

    const { error } = await updatePassword(
      values.oldPassword,
      values.newPassword,
      csrfToken,
    );
    if (error) {
      setError("root", {
        message: error.message,
      });
      return;
    }

    navigate("/account");
  }

  return (
    <>
      <title>Change Password | Issho</title>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="oldPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Old Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="oldP@assw0rd8to64char"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="newP@assw0rd8to64char"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="newP@assw0rd8to64char"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      disabled={isSubmitting}
                    >
                      Save
                    </Button>
                    {errors.root?.message && !isSubmitting && (
                      <div className="text-destructive text-sm text-center">
                        {errors.root?.message}
                      </div>
                    )}
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
