import { useEffect } from "react";
import { useNavigate } from "react-router";

import DestructivePage from "~/components/pages/destructive-page";
import { useSession } from "~/contexts/session-context";
import { useSignOutAll } from "~/hooks/use-auth";

export default function Page() {
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const signOutAllMutation = useSignOutAll();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  async function onSignOutAll() {
    if (!csrfToken) {
      return { error: "No CSRF token available" };
    }
    try {
      await signOutAllMutation.mutateAsync(csrfToken);
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Sign out all failed",
      };
    }
  }

  return (
    <>
      <title>Sign Out All Devices | Issho</title>
      <DestructivePage
        title="Sign Out All Devices"
        description="Are you sure you want to sign out of your account on all devices? You will be logged out everywhere."
        action={onSignOutAll}
        redirectTo="/auth/sign-in"
      />
    </>
  );
}
