import { useEffect } from "react";
import { useNavigate } from "react-router";

import DestructivePage from "~/components/pages/destructive-page";
import { useSession } from "~/contexts/session-context";
import { signOut } from "~/lib/db/auth";

export default function Page() {
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  async function onSignOut() {
    if (!csrfToken) {
      return { error: "No CSRF token available" };
    }
    const result = await signOut(csrfToken);
    return { error: result.error ? result.error.message : null };
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
