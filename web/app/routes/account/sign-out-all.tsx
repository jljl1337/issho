import { useEffect } from "react";
import { useNavigate } from "react-router";

import DestructivePage from "~/components/pages/destructive-page";
import { useSession } from "~/contexts/session-context";
import { signOutAll } from "~/lib/db/auth";

export default function Page() {
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  async function onSignOutAll() {
    if (!csrfToken) {
      return { error: "No CSRF token available" };
    }
    const result = await signOutAll(csrfToken);
    return { error: result.error ? result.error.message : null };
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
