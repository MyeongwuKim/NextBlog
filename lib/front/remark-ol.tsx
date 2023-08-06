import React, { useEffect, useState } from "react";
import runmode, { getLanguage } from "./runmode";

type Tokens = {
  text: string;
  style: string | null;
}[];

const RemarkOL: React.FC<
  React.DetailedHTMLProps<
    React.OlHTMLAttributes<HTMLOListElement>,
    HTMLOListElement
  >
> = (props) => {
  const { children } = props;

  useEffect(() => {}, [children]);
  return <ol>{children}</ol>;
};

export default RemarkOL;
