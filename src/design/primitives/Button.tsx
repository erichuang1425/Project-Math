import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "ghost" | "subtle" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.primary,
  ghost: styles.ghost,
  subtle: styles.subtle,
  danger: styles.danger
};

const sizeClass: Record<ButtonSize, string | undefined> = {
  sm: styles.sizeSm,
  md: undefined,
  lg: styles.sizeLg
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={clsx(
        styles.button,
        variantClass[variant],
        sizeClass[size],
        fullWidth && styles.fullWidth,
        className
      )}
    >
      {leadingIcon ? <span aria-hidden="true">{leadingIcon}</span> : null}
      {children}
      {trailingIcon ? <span aria-hidden="true">{trailingIcon}</span> : null}
    </button>
  );
}
