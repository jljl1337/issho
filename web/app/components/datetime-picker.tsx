import { useState } from "react";

import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
}

export function DateTimePicker({
  value,
  onChange,
  label = "Publish Date & Time",
}: DateTimePickerProps) {
  const { t } = useTranslation();

  const now = new Date();
  const currentYear = now.getFullYear();

  const [year, setYear] = useState<string | undefined>(
    value ? String(value.getFullYear()) : undefined,
  );
  const [month, setMonth] = useState<string | undefined>(
    value ? String(value.getMonth() + 1) : undefined,
  );
  const [day, setDay] = useState<string | undefined>(
    value ? String(value.getDate()) : undefined,
  );
  const [hour, setHour] = useState<string | undefined>(
    value ? String(value.getHours() % 12 || 12) : undefined,
  );
  const [minute, setMinute] = useState<string | undefined>(
    value ? String(value.getMinutes()).padStart(2, "0") : undefined,
  );
  const [period, setPeriod] = useState<"am" | "pm" | undefined>(
    value ? (value.getHours() >= 12 ? "pm" : "am") : undefined,
  );

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const updateDateTime = (
    newYear?: string,
    newMonth?: string,
    newDay?: string,
    newHour?: string,
    newMinute?: string,
    newPeriod?: "am" | "pm",
  ) => {
    const y = newYear ?? year;
    const mo = newMonth ?? month;
    const d = newDay ?? day;
    const h = newHour ?? hour;
    const m = newMinute ?? minute;
    const p = newPeriod ?? period;

    // Only create date if all fields are set
    if (!y || !mo || !d || !h || !m || !p) {
      onChange(null);
      return;
    }

    const hours24 =
      p === "pm" && h !== "12"
        ? Number(h) + 12
        : p === "am" && h === "12"
          ? 0
          : Number(h);

    const newDate = new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      hours24,
      Number(m),
      0,
      0,
    );
    onChange(newDate);
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    updateDateTime(
      newYear,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    if (year && day) {
      const daysInMonth = getDaysInMonth(Number(year), Number(newMonth));
      if (Number(day) > daysInMonth) {
        setDay(String(daysInMonth));
        updateDateTime(
          undefined,
          newMonth,
          String(daysInMonth),
          undefined,
          undefined,
          undefined,
        );
      } else {
        updateDateTime(
          undefined,
          newMonth,
          undefined,
          undefined,
          undefined,
          undefined,
        );
      }
    } else {
      updateDateTime(
        undefined,
        newMonth,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    }
  };

  const handleDayChange = (newDay: string) => {
    setDay(newDay);
    updateDateTime(
      undefined,
      undefined,
      newDay,
      undefined,
      undefined,
      undefined,
    );
  };

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    updateDateTime(
      undefined,
      undefined,
      undefined,
      newHour,
      undefined,
      undefined,
    );
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    updateDateTime(
      undefined,
      undefined,
      undefined,
      undefined,
      newMinute,
      undefined,
    );
  };

  const handlePeriodChange = (newPeriod: string) => {
    const p = newPeriod as "am" | "pm";
    setPeriod(p);
    updateDateTime(undefined, undefined, undefined, undefined, undefined, p);
  };

  const handleSetNow = () => {
    const now = new Date();
    onChange(now);
    setYear(String(now.getFullYear()));
    setMonth(String(now.getMonth() + 1));
    setDay(String(now.getDate()));
    setHour(String(now.getHours() % 12 || 12));
    setMinute(String(now.getMinutes()).padStart(2, "0"));
    setPeriod(now.getHours() >= 12 ? "pm" : "am");
  };

  const handleClear = () => {
    onChange(null);
    setYear(undefined);
    setMonth(undefined);
    setDay(undefined);
    setHour(undefined);
    setMinute(undefined);
    setPeriod(undefined);
  };

  const daysInCurrentMonth =
    year && month ? getDaysInMonth(Number(year), Number(month)) : 31;

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Select value={year} onValueChange={handleYearChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("time:year")} />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => {
              const y = String(currentYear - 5 + i);
              return (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select value={month} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("time:month")} />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const m = String(i + 1);
              return (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select value={day} onValueChange={handleDayChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("time:day")} />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: daysInCurrentMonth }, (_, i) => {
              const d = String(i + 1);
              return (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Select value={hour} onValueChange={handleHourChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("time:hour")} />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const h = String(i + 1);
              return (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select value={minute} onValueChange={handleMinuteChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("time:minute")} />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 60 }, (_, i) => {
              const m = String(i).padStart(2, "0");
              return (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("time:period")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="am">{t("time:am")}</SelectItem>
            <SelectItem value="pm">{t("time:pm")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        {(year || month || day || hour || minute || period) && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleClear}
            className="flex-1"
          >
            {t("common:reset")}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={handleSetNow}
          className="flex-1"
        >
          {t("time:setToNow")}
        </Button>
      </div>
    </div>
  );
}
