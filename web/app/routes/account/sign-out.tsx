import { useEffect } from "react";
import { useNavigate } from "react-router";

import DestructivePage from "~/components/pages/destructive-page";
import { useSession } from "~/contexts/session-context";
import { useSignOut } from "~/hooks/use-auth";

export default function Page() {
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const signOutMutation = useSignOut();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  async function onSignOut() {
    if (!csrfToken) {
      return { error: "No CSRF token available" };
    }
    try {
      await signOutMutation.mutateAsync(csrfToken);
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Sign out failed",
      };
    }
  }

  return (
    <>
      <title>Sign Out | Issho</title>
      <DestructivePage
        title="Sign Out"
        description="Are you sure you want to sign out of your account on this device?"
        action={onSignOut}
        redirectTo="/auth/sign-in"
      />
    </>
  );
}
