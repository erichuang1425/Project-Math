import clsx from "clsx";
import type { HTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

type CommonProps = {
  illustration?: ReactNode;
  title?: ReactNode;
  summary?: ReactNode;
  footer?: ReactNode;
  padding?: "default" | "compact" | "padded";
  children?: ReactNode;
  className?: string;
};

type StaticCardProps = CommonProps & HTMLAttributes<HTMLDivElement> & { as?: "div" };

type InteractiveCardProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as: "button" };

export type CardProps = StaticCardProps | InteractiveCardProps;

const paddingClass = {
  default: undefined,
  compact: "compact",
  padded: "padded"
} as const;

export function Card(props: CardProps) {
  const {
    illustration,
    title,
    summary,
    footer,
    padding = "default",
    children,
    className
  } = props;

  const padCls = paddingClass[padding];
  const sharedCls = clsx(
    styles.card,
    padCls === "compact" && styles.compact,
    padCls === "padded" && styles.padded,
    className
  );

  const body = (
    <>
      {illustration ? <div className={styles.illustration}>{illustration}</div> : null}
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {summary ? <p className={styles.summary}>{summary}</p> : null}
      {children}
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </>
  );

  if (props.as === "button") {
    const { as: _as, illustration: _i, title: _t, summary: _s, footer: _f, padding: _p, children: _c, className: _cn, ...rest } = props;
    void _as;
    void _i;
    void _t;
    void _s;
    void _f;
    void _p;
    void _c;
    void _cn;
    return (
      <button {...rest} type={rest.type ?? "button"} className={clsx(sharedCls, styles.interactive)}>
        {body}
      </button>
    );
  }

  const { as: _as, illustration: _i, title: _t, summary: _s, footer: _f, padding: _p, children: _c, className: _cn, ...rest } = props as StaticCardProps;
  void _as;
  void _i;
  void _t;
  void _s;
  void _f;
  void _p;
  void _c;
  void _cn;
  return (
    <div {...rest} className={sharedCls}>
      {body}
    </div>
  );
}
