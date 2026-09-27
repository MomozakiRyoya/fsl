import { Fragment } from "react";
import { nameParts } from "./name-parts";

/** 長いチーム名を大文字の区切りで折り返せるようにする（CRownCLownCRew → CRown|CLown|CRew） */
export default function BreakableName({ name }: { name: string }) {
  return (
    <>
      {nameParts(name).map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <wbr />}
          {part}
        </Fragment>
      ))}
    </>
  );
}
