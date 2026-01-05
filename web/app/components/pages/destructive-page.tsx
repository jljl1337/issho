import { useState } from "react";
import { useNavigate } from "react-router";

import { CenteredPage } from "../layouts/centered-page";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface DestructivePageProps {
  title: string;
  description: string;
  action: () => Promise<{ error: string | null }>;
  redirectTo: string;
}

export default function DestructivePage({
  title,
  description,
  action,
  redirectTo,
}: DestructivePageProps) {
  const { t } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onDestructive() {
    setIsLoading(true);
    setError(null);

    const response = await action();

    if (response.error != null) {
      setError(response.error);
      setIsLoading(false);
      return;
    }

    navigate(redirectTo);
  }

  return (
    <CenteredPage>
      <Card className="w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-end gap-2">
              <Button variant={"outline"} onClick={() => navigate(-1)}>
                {t("cancel")}
              </Button>
              <Button
                variant={"destructive"}
                onClick={onDestructive}
                disabled={isLoading}
              >
                {t("confirm")}
              </Button>
            </div>
            {error && !isLoading && (
              <div className="text-destructive text-sm text-center">
                {error}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </CenteredPage>
  );
}
