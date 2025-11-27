import { useEffect } from "react";

import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t("navigation.home")} | Issho`;
  }, [t]);

  return (
    <>
      <div className="h-full flex items-center justify-center">
        <div className="h-full max-w-[90rem] flex-1 flex flex-col p-8 gap-4">
          <h1 className="text-4xl">{t("navigation.home")}</h1>
        </div>
      </div>
    </>
  );
}
