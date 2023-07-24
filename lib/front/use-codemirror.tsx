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
}
const useCodeMirror = <T extends Element>(
  props: Props
): [React.MutableRefObject<T | null>, EditorView?] => {
  const refContainer = useRef<T>(null);
  const [editorView, setEditorView] = useState<EditorView>();
  const { onChange } = props;

  const transparentTheme = EditorView.theme(
    {
      "&": {
        backgroundColor: "rgb(255,255,255); !important",
        height: "100%",
      },
      ".cm-line": {
        fontSize: "20px",
        color: "white",
      },
      ".cm-content": {},
    },
    { dark: false }
  );

  useEffect(() => {
    if (!refContainer.current) return;

    const baseTheme = EditorView.baseTheme({
      ".cm-scroller": {
        "font-family": "font-sans",
      },
    });

    const syntaxHighlighting = HighlightStyle.define([
      {
        tag: tags.heading1,
        fontSize: "2.0em",
        fontWeight: "bold",
      },
      {
        tag: tags.heading2,
        fontSize: "1.8em",
        fontWeight: "bold",
      },
      {
        tag: tags.heading3,
        fontSize: "1.6em",
        fontWeight: "bold",
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
        baseTheme,
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
  }, [refContainer, onChange]);

  return [refContainer, editorView];
};

export default useCodeMirror;
