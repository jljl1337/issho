import { useState } from "react";

import { Calendar as CalendarIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { formatDate } from "~/lib/format/date";

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
  const { t, i18n } = useTranslation();
  const [hour, setHour] = useState(
    value ? String(value.getHours() % 12 || 12) : "12",
  );
  const [minute, setMinute] = useState(
    value ? String(value.getMinutes()).padStart(2, "0") : "00",
  );
  const [period, setPeriod] = useState<"am" | "pm">(
    value && value.getHours() >= 12 ? "pm" : "am",
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    const hours24 =
      period === "pm" && hour !== "12"
        ? Number(hour) + 12
        : period === "am" && hour === "12"
          ? 0
          : Number(hour);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours24, Number(minute), 0, 0);
    onChange(newDate);
  };

  const updateTime = (
    newHour?: string,
    newMinute?: string,
    newPeriod?: "am" | "pm",
  ) => {
    if (!value) return;

    const h = newHour ?? hour;
    const m = newMinute ?? minute;
    const p = newPeriod ?? period;

    const hours24 =
      p === "pm" && h !== "12"
        ? Number(h) + 12
        : p === "am" && h === "12"
          ? 0
          : Number(h);

    const newDate = new Date(value);
    newDate.setHours(hours24, Number(m), 0, 0);
    onChange(newDate);
  };

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    updateTime(newHour, undefined, undefined);
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    updateTime(undefined, newMinute, undefined);
  };

  const handlePeriodChange = (newPeriod: string) => {
    const p = newPeriod as "am" | "pm";
    setPeriod(p);
    updateTime(undefined, undefined, p);
  };

  const handleSetNow = () => {
    const now = new Date();
    onChange(now);
    setHour(String(now.getHours() % 12 || 12));
    setMinute(String(now.getMinutes()).padStart(2, "0"));
    setPeriod(now.getHours() >= 12 ? "pm" : "am");
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!value}
              className="data-[empty=true]:text-muted-foreground flex-1 justify-start text-left font-normal"
            >
              <CalendarIcon className="h-4 w-4" />
              {value ? (
                formatDate(value, i18n.language)
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
      {value && (
        <div className="flex gap-2">
          <Select value={hour} onValueChange={handleHourChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
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
              <SelectValue />
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
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="am">{t("time:am")}</SelectItem>
              <SelectItem value="pm">{t("time:pm")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex gap-2">
        {value && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="flex-1"
          >
            <X className="h-4 w-4" />
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
