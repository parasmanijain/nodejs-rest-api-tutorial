import { FC, ReactNode } from "react";
import classes from "./Paginator.module.scss";

export interface PaginatorProps {
  children?: ReactNode;
  currentPage: number;
  lastPage: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const Paginator: FC<PaginatorProps> = ({ children, currentPage, lastPage, onPrevious, onNext }) => (
  <div className={classes["paginator"]}>
    {children}
    <div className={classes["paginator__controls"]}>
      {currentPage > 1 && (
        <button
          className={classes["paginator__control"]}
          onClick={onPrevious}
        >
          Previous
        </button>
      )}
      {currentPage < lastPage && (
        <button
          className={classes["paginator__control"]}
          onClick={onNext}
        >
          Next
        </button>
      )}
    </div>
  </div>
);