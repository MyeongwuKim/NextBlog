import React, { createElement, useEffect, useState } from "react";

type Tokens = {
  text: string;
  style: string | null;
}[];

const RemarkP: React.FC<
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >
> = (props) => {
  const { children } = props;

  useEffect(() => {}, [children]);

  return <p>{children}</p>;
};

export default RemarkP;
