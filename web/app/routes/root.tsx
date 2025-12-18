import { useEffect } from "react";
import { useNavigate } from "react-router";

import { Spinner } from "~/components/ui/spinner";

import { CenteredPage } from "~/components/layouts/centered-page";
import { useSession } from "~/contexts/session-context";
import { isUser } from "~/lib/validation/role";

export default function Page() {
  const { isLoggedIn, isLoading, user } = useSession();
  const navigate = useNavigate();

  // Redirect based on auth state
  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn && user) {
        const destination = isUser(user.role) ? "/home" : "/admin/posts";
        navigate(destination);
      } else {
        navigate("/auth/sign-in");
      }
    }
  }, [isLoggedIn, isLoading, user, navigate]);

  return (
    <div className="h-svh">
      <CenteredPage>
        <Spinner className="size-8" />
      </CenteredPage>
    </div>
  );
}
