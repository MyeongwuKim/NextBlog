import React, { Children, useEffect, useState } from "react";
import runmode, { getLanguage } from "./runmode";
import { CodeProps } from "react-markdown/lib/ast-to-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

type Tokens = {
  text: string;
  style: string | null;
}[];

const RemarkCode:
  | React.ComponentClass<CodeProps, any>
  | React.FunctionComponent<CodeProps> = (props) => {
  const [spans, setSpans] = useState<Tokens>([]);
  const { className, children } = props;
  const langName = (className || "").substr(9);

  useEffect(() => {
    getLanguage(langName).then((language) => {
      if (language) {
        const body = props.children instanceof Array ? props.children[0] : null;
        const tokens: Tokens = [];
        runmode(
          body as string,
          language,
          (text: string, style: string | null, _from: number, _to: number) => {
            tokens.push({ text, style });
          }
        );

        setSpans(tokens);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.children]);

  return (
    <SyntaxHighlighter
      language={className?.replace("language-", "")}
      style={materialDark}
    >
      {children.toString()}
    </SyntaxHighlighter>
  );
};

export default RemarkCode;
