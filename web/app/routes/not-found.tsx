import { useEffect } from "react";

import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("navigation.notFound")} | Issho`;
  }, [t]);

  // return a page takes up the full screen and says 404 - Not Found in the center
  return (
    <>
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
        <h1 className="text-6xl font-bold">{t("navigation.notFoundCode")}</h1>
        <p className="mt-4 text-xl">{t("navigation.notFound")}</p>
      </div>
    </>
  );
}
