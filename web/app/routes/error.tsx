import { useEffect } from "react";

import { useTranslation } from "react-i18next";

export default function Error() {
  const { t } = useTranslation("error");

  useEffect(() => {
    document.title = `${t("title")} | Issho`;
  }, [t]);

  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
        <h1 className="text-6xl font-bold">{t("oops")}</h1>
        <p className="mt-4 text-xl">{t("message")}</p>
      </div>
    </>
  );
}
