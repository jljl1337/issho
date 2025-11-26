import { useEffect } from "react";
import { useNavigate } from "react-router";

import DestructivePage from "~/components/pages/destructive-page";
import { useSession } from "~/contexts/session-context";
import { useDeleteMe } from "~/hooks/use-user";

export default function Page() {
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const deleteMeMutation = useDeleteMe();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  async function onDeleteAccount() {
    if (!csrfToken) {
      return { error: "No CSRF token available" };
    }
    try {
      await deleteMeMutation.mutateAsync(csrfToken);
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Delete account failed",
      };
    }
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
