import { useState } from "react";

import { Calendar as CalendarIcon, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

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
  const { i18n } = useTranslation();
  const [time, setTime] = useState(
    value ? value.toTimeString().slice(0, 5) : "12:00",
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    const [hours, minutes] = time.split(":").map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    onChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);

    if (value) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  const handleSetNow = () => {
    const now = new Date();
    onChange(now);
    setTime(now.toTimeString().slice(0, 5));
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
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            title="Clear date"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && (
        <Input
          type="time"
          value={time}
          onChange={handleTimeChange}
          className="w-full"
        />
      )}
      <Button
        type="button"
        variant="outline"
        onClick={handleSetNow}
        className="w-full"
      >
        Set to Now
      </Button>
    </div>
  );
}
