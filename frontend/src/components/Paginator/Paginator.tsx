import { FC, ReactNode } from "react";
import classes from "./Paginator.module.scss";

export interface PaginatorProps {
  children?: ReactNode;
  currentPage: number;
  lastPage: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const Paginator: FC<PaginatorProps> = (props) => (
  <div className={classes["paginator"]}>
    {props.children}
    <div className={classes["paginator__controls"]}>
      {props.currentPage > 1 && (
        <button
          className={classes["paginator__control"]}
          onClick={props.onPrevious}
        >
          Previous
        </button>
      )}
      {props.currentPage < props.lastPage && (
        <button
          className={classes["paginator__control"]}
          onClick={props.onNext}
        >
          Next
        </button>
      )}
    </div>
  </div>
);