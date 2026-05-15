import { ChevronRight } from "lucide-react";
import styles from "./Breadcrumb.module.css";

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={`${item.label}-${idx}`} className={styles.crumbWrap}>
            {item.onClick && !isLast ? (
              <button type="button" className={styles.crumb} onClick={item.onClick}>
                {item.label}
              </button>
            ) : (
              <span className={isLast ? styles.current : styles.crumb} aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            )}
            {!isLast ? (
              <span className={styles.separator} aria-hidden="true">
                <ChevronRight size={14} />
              </span>
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
