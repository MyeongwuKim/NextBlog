import React, { useEffect, useState, useRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { history, historyKeymap } from "@codemirror/history";
import { indentOnInput } from "@codemirror/language";
import { bracketMatching } from "@codemirror/matchbrackets";
import {
  defaultHighlightStyle,
  HighlightStyle,
  tags,
} from "@codemirror/highlight";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";

interface Props {
  initialDoc: string;
  onChange?: (doc: string) => void;
  theme: string | undefined;
}

const useCodeMirror = <T extends Element>(
  props: Props
): [React.MutableRefObject<T | null>, EditorView?] => {
  const refContainer = useRef<T>(null);
  const [editorView, setEditorView] = useState<EditorView>();
  const { onChange, theme } = props;

  // const transparentTheme = EditorView.theme(
  //   {
  //     "&": {
  //       backgroundColor: "rgb(255,255,255); !important",
  //       height: "100%",
  //     },
  //     ".cm-line": {
  //       fontSize: "20px",
  //       color: "white",
  //     },
  //     ".cm-content": {},
  //   },
  //   { dark: false }
  // );

  useEffect(() => {
    if (!refContainer.current) return;

    let bg = theme == "dark" ? "black" : "white";
    let caret = theme == "dark" ? "white" : "gray";
    let textColor = theme == "dark" ? "white" : "rgb(30 41 59)";

    // const baseTheme = EditorView.baseTheme({
    //   ".dark .cm-line": {
    //     color: textColor,
    //     backgroundColor: bg,
    //     fontSize: "16px",
    //   },
    //   ".dark .cm-content": {
    //     backgroundColor: bg,
    //     "caret-color": caret,
    //   },
    //   ".light .cm-line": {
    //     color: textColor,
    //     backgroundColor: bg,
    //     fontSize: "16px",
    //   },
    //   ".light .cm-content": {
    //     backgroundColor: bg,
    //     "caret-color": caret,
    //   },
    // });

    const syntaxHighlighting = HighlightStyle.define([
      {
        tag: tags.heading1,
        fontSize: "2.0em",
        fontWeight: "bold",
        color: textColor,
      },
      {
        tag: tags.heading2,
        fontSize: "1.8em",
        fontWeight: "bold",
        color: textColor,
      },
      {
        tag: tags.heading3,
        fontSize: "1.6em",
        fontWeight: "bold",
        color: textColor,
      },
    ]);
    const editorTheme = new Compartment();
    const startState = EditorState.create({
      doc: props.initialDoc,
      extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        indentOnInput(),
        bracketMatching(),
        defaultHighlightStyle.fallback,
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
          addKeymap: true,
        }),
        syntaxHighlighting,
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.changes) {
            onChange && onChange(update.state.doc.toString());
          }
        }),
      ],
    });
    // let tr = startState.update(startState.replaceSelection("!"));
    // console.log(tr.state.doc.toString()); // "!o!"
    //view.focus();
    const view = new EditorView({
      state: startState,
      parent: refContainer.current,
    });

    setEditorView(view);
  }, [refContainer, theme, onChange]);

  return [refContainer, editorView];
};

export default useCodeMirror;
