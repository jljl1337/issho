import { useEffect } from "react";
import { useNavigate } from "react-router";

import DestructivePage from "~/components/pages/destructive-page";
import { useSession } from "~/contexts/session-context";
import { deleteMe } from "~/lib/db/users";

export default function Page() {
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  async function onDeleteAccount() {
    if (!csrfToken) {
      return { error: "No CSRF token available" };
    }
    const result = await deleteMe(csrfToken);
    return { error: result.error ? result.error.message : null };
  }

  return (
    <>
      <title>Delete Account | Issho</title>
      <DestructivePage
        title="Delete Account"
        description="Are you sure you want to delete your account? This action is irreversible and will permanently delete all your data."
        action={onDeleteAccount}
        redirectTo="/auth/sign-in"
      />
    </>
  );
}
