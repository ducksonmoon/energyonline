"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

function formatWithCommas(digits: string): string {
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

// Prices need thousand separators for readability, but a native
// type="number" input can't display formatted text (browsers strip
// anything that isn't a digit). Shows the formatted text, submits the raw
// digits via a hidden field with the real field name.
export function PriceInput({
  id,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  id: string;
  name: string;
  defaultValue?: number | null;
  required?: boolean;
  placeholder?: string;
}) {
  const [display, setDisplay] = useState(defaultValue != null ? formatWithCommas(String(defaultValue)) : "");
  const [raw, setRaw] = useState(defaultValue != null ? String(defaultValue) : "");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setRaw(digits);
    setDisplay(formatWithCommas(digits));
  }

  return (
    <>
      <input type="hidden" name={name} value={raw} readOnly />
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={display}
        onChange={handleChange}
        required={required}
        dir="ltr"
        className="text-left"
      />
    </>
  );
}
