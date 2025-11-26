import { useEffect } from "react";
import { redirect, useNavigate } from "react-router";
import type { Route } from "./+types/about";

import { useVersion } from "~/hooks/use-version";

export default function Page() {
  const navigate = useNavigate();
  const { data: version, isLoading, error } = useVersion();

  useEffect(() => {
    if (error) {
      navigate("/error");
    }
  }, [error, navigate]);

  return (
    <>
      <title>About | Issho</title>
      <div className="h-full flex items-center justify-center">
        <div className="h-full max-w-[90rem] flex-1 flex flex-col p-8 gap-4">
          <h1 className="text-4xl">About</h1>
          <p className="mb-2">Version: {isLoading ? "Loading..." : version}</p>
        </div>
      </div>
    </>
  );
}
