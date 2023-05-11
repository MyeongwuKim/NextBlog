import { NextPage } from "next";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Editor from "@/components/editor";
import Preview from "@/components/preview";
import { useTheme } from "next-themes";
import useCodeMirror from "@/lib/use-codemirror";
import ToolBar from "@/components/toolbar";

const Write: NextPage = () => {
  const theme = useTheme().theme;
  const [doc, setDoc] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const handleDocChange = useCallback((newDoc: string) => {
    setDoc(newDoc);
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    setTitle(title);
  }, []);

  //const handleChange = useCallback((doc: string) => onChange(doc), [onChange]);

  let [refContainer, editorView] = useCodeMirror<HTMLDivElement>({
    initialDoc: doc,
    onChange: handleDocChange,
    theme: useTheme()?.theme!,
  });

  useEffect(() => {}, [editorView]);

  return (
    <div className="bg-gray-100 dark:bg-zinc-900 h-full px-[5%] py-[5%] w-full  flex flex-col">
      <div className="flex flex-col h-full dark:border-gray-500 border-2">
        <ToolBar editorView={editorView!} theme={useTheme().theme} />

        <div className="border-[1px] dark:border-gray-500"></div>
        <div className="flex w-full h-[calc(100%-50px)]">
          <Editor
            editorView={editorView!}
            refContainer={refContainer}
            handleTitleChange={handleTitleChange}
            theme={useTheme()?.theme!}
          />
          <div className="border-[1px] dark:border-gray-500"></div>
          <Preview doc={doc} title={title} />
        </div>
      </div>
    </div>
  );
};

export default Write;
