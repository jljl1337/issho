import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";

import { useTranslation } from "react-i18next";

import { useSession } from "~/contexts/session-context";

export default function Page() {
  const { t } = useTranslation("navigation");
  const { isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `Edit Post | Issho`;
  }, []);

  return (
    <>
      <div className="h-full flex items-center justify-center">
        <div className="h-full max-w-[90rem] flex-1 flex flex-col p-8 gap-4">
          <h1 className="text-4xl">Edit Post</h1>
          <p className="text-muted-foreground">
            Post editing form for post ID: {id}
          </p>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      </div>
    </>
  );
}
