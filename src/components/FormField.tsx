import { InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const FormField = forwardRef<HTMLInputElement, Props>(
  function FormField({ label, error, hint, id, className = "", ...rest }, ref) {
    const inputId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-xs font-medium uppercase tracking-[0.12em] text-fg-muted"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full rounded-md border bg-bg-elev px-3 py-2 text-sm text-fg",
            "placeholder:text-fg-subtle",
            "transition-colors outline-none",
            "focus:border-accent focus:ring-1 focus:ring-accent/40",
            error ? "border-red-500/60" : "border-border hover:border-fg-subtle",
            className,
          ].join(" ")}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...rest}
        />
        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-fg-subtle">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);