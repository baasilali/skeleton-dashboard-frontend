import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  /** Current selected value */
  value: string;
  /** Called when the user selects an option */
  onValueChange: (value: string) => void;
  /** Placeholder text shown when no option is selected */
  placeholder: string;
  /** Label shown at the top of the dropdown list */
  label?: string;
  /** Options rendered inside the dropdown */
  options: FilterOption[];
  /** Optional width utility-class for the trigger (defaults to w-[180px]) */
  triggerWidthClass?: string;
  /** Whether to include the built-in "reset" option that clears the filter. Defaults to true. */
  includeResetOption?: boolean;
  /** Label to use for the reset option. Defaults to placeholder when omitted. */
  resetLabel?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onValueChange,
  placeholder,
  label,
  options,
  triggerWidthClass = "w-[180px]",
  includeResetOption = true,
  resetLabel,
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerWidthClass}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {label && <SelectLabel>{label}</SelectLabel>}
          {includeResetOption && (
            <SelectItem value="__reset">{resetLabel ?? placeholder}</SelectItem>
          )}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}; 