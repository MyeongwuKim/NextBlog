import { NextPage } from "next";
import { EditorSelection, EditorState, Text } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createErrorMsg } from "@/hooks/useGlobal";

import { useSession } from "next-auth/react";
import { SearchCursor } from "@codemirror/search";
import { getTimeStamp, getDeliveryDomain } from "@/hooks/useUtils";

interface IToolBar {
  theme: string | undefined;
  editorView: EditorView;
}

const ToolBar: NextPage<IToolBar> = (props) => {
  const { data } = useSession();
  let timeStamp = getTimeStamp();
  const { editorView } = props;
  const { watch, register, setValue } = useForm();
  const imageFile = watch("image");

  //이미지 송신, 완료하면 url 변경
  const onUploadImgEvt = useCallback(
    async (file: any) => {
      editorView?.focus();
      const imgURL = URL.createObjectURL(file);
      let line = editorView?.state.doc.lineAt(
        editorView?.state.selection.main.from
      )!;
      let startCaret = editorView!.state.selection.ranges[0].from - line.from;
      let endCaret =
        editorView!.state.selection.ranges[0].to -
        editorView!.state.selection.ranges[0].from;

      let cutStr = line?.text.substring(startCaret, startCaret + endCaret);

      let link = `![${cutStr!.length > 0 ? cutStr : "업로드중"}](${imgURL})`;
      let state = editorView?.state!;
      let tr = state.update(state.replaceSelection(link));

      editorView?.dispatch(tr);

      try {
        const { uploadURL } = await (
          await fetch(`/api/files`, { method: "POST" })
        ).json();

        const form = new FormData();
        let today = new Date();

        let userId = data.accessToken.id;

        form.append(
          "file",
          file as any,
          `${userId.toString()}_post_${timeStamp()}`
        );
        const {
          result: { id },
        } = await (
          await fetch(uploadURL, {
            method: "POST",
            body: form,
          })
        ).json();

        let cursor = new SearchCursor(editorView.state.doc, link);
        cursor.next();

        editorView?.dispatch({
          changes: {
            from: cursor.value.from,
            to: cursor.value.to,
            insert: `![](${getDeliveryDomain(id, "public")})`,
          },
        });
      } catch {
        createErrorMsg("이미지 업로드중 실패하였습니다", true);
      }

      // editorView?.dispatch({
      //   selection: EditorSelection.create(
      //     [
      //       EditorSelection.range(newFrom, newTo),
      //       EditorSelection.cursor(newTo),
      //     ],
      //     1
      //   ),
      // });
    },
    [editorView, data]
  );

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file: any = imageFile[0];
      onUploadImgEvt(file);
      setValue("image", "");
      //URL.revokeObjectURL(url);
    }
  }, [imageFile, onUploadImgEvt]);

  const onLinkEvt = () => {
    editorView?.focus();

    let line = editorView?.state.doc.lineAt(
      editorView?.state.selection.main.from
    )!;
    let startCaret = editorView!.state.selection.ranges[0].from - line.from;
    let endCaret =
      editorView!.state.selection.ranges[0].to -
      editorView!.state.selection.ranges[0].from;

    let cutStr = line?.text.substring(startCaret, startCaret + endCaret);

    let link = `[${cutStr!.length > 0 ? cutStr : "NAME"}](https://)`;
    let state = editorView?.state!;
    let tr = state.update(state.replaceSelection(link));

    editorView?.dispatch(tr);

    let newFrom = state.selection.main.from + 1;
    let newTo = state.selection.main.from + link.indexOf("]");

    editorView?.dispatch({
      selection: EditorSelection.create(
        [EditorSelection.range(newFrom, newTo), EditorSelection.cursor(newTo)],
        1
      ),
    });
  };

  const onCodeEvt = () => {
    editorView?.focus();

    let line = editorView?.state.doc.lineAt(
      editorView?.state.selection.main.from
    )!;
    let startCaret = editorView!.state.selection.ranges[0].from - line.from;
    let endCaret =
      editorView!.state.selection.ranges[0].to -
      editorView!.state.selection.ranges[0].from;

    let cutStr = line?.text.substring(startCaret, startCaret + endCaret);
    let link =
      "\n```js\n" +
      `${cutStr!.length > 0 ? cutStr : "input code plz"}` +
      "\n```";
    let state = editorView?.state!;
    let tr = state.update(state.replaceSelection(link));
    editorView?.dispatch(tr);

    let curLine = editorView?.state.doc.lineAt(
      editorView?.state.selection.main.from
    );
    let prevLine = editorView?.state.doc.line(curLine!.number - 1)!;

    editorView?.dispatch({
      selection: EditorSelection.create(
        [
          EditorSelection.range(prevLine.from, prevLine.to),
          EditorSelection.cursor(prevLine.from),
        ],
        1
      ),
    });
  };
  const onTwoSymbolEvt = (evtName: string) => {
    editorView?.focus();

    let state = editorView?.state!;
    //current selection line Info, if style is true, LineText state **BOLD**
    let line = state.doc.lineAt(state.selection.main.from);
    let startCaret = editorView!.state.selection.ranges[0].from - line.from;
    let endCaret =
      editorView!.state.selection.ranges[0].to -
      editorView!.state.selection.ranges[0].from;

    let cutStr = line?.text.substring(startCaret, startCaret + endCaret);

    let remove = false;
    if (
      cutStr.indexOf(evtName) > -1 &&
      cutStr.indexOf(evtName, cutStr.indexOf(evtName) + 1) > -1
    ) {
      remove = true;
    }

    let symbolText = remove
      ? cutStr.replaceAll(evtName, "")
      : `${evtName}${cutStr.length > 0 ? cutStr : "TEXT"}${evtName}`;

    let tr = state.update(state.replaceSelection(symbolText));
    editorView?.dispatch(tr); // dispatch new doc state

    if (!remove) {
      let newFrom = state.selection.main.from + evtName.length;
      let newTo =
        state.selection.main.from + symbolText.indexOf(evtName, evtName.length);
      editorView?.dispatch({
        selection: EditorSelection.create(
          [
            EditorSelection.range(newFrom, newTo),
            EditorSelection.cursor(newTo),
          ],
          1
        ),
      });
    }
  };
  const onOneSymbolEvt = (evtName: string) => {
    editorView?.focus();

    let state = editorView?.state!;
    let line = state.doc.lineAt(state.selection.main.from); //current selection line Info

    let tr = state.update({
      changes: {
        from: line.from,
        to: line.to,
        insert: `${evtName} ${line.text.replace(/#| /g, "")}`,
      },
    });

    editorView?.dispatch(tr); // dispatch new doc state
    let endLine = tr.state.doc.toString().length;
    editorView?.dispatch({
      selection: EditorSelection.create(
        [
          EditorSelection.range(endLine, endLine),
          EditorSelection.cursor(endLine),
        ],
        1
      ),
    });
  };

  return (
    <div>
      <div className="shadow-md dark:shadow-black dark:bg-zinc-800 p-2 flex items-center relative h-auto font-semibold dark:border-zinc-800 [&>button]:select-none">
        <button
          className="w-8 h-8 relative hover:dark:bg-zinc-800 hover:bg-slate-200"
          onClick={() => onOneSymbolEvt("#")}
        >
          H1
        </button>
        <button
          className="w-8 h-8 relative hover:dark:bg-zinc-800 hover:bg-slate-200"
          onClick={() => onOneSymbolEvt("##")}
        >
          H2
        </button>
        <button
          className="w-8 h-8 relative hover:dark:bg-zinc-800 hover:bg-slate-200"
          onClick={() => onOneSymbolEvt("###")}
        >
          H3
        </button>
        <span className="relative h-6 border-[1px] dark:border-zinc-500 mx-2" />
        <button
          className="w-8 h-8 relative hover:dark:bg-zinc-800 hover:bg-slate-200"
          onClick={() => onTwoSymbolEvt("**")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={0}
            stroke="currentColor"
            className="w-8 m-auto h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"
            />
          </svg>
        </button>
        <button
          className="w-8 h-8 relative hover:dark:bg-zinc-800 hover:bg-slate-200"
          onClick={() => onTwoSymbolEvt("_")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={0}
            stroke="currentColor"
            className="w-8 m-auto h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"
            />
          </svg>
        </button>
        <button
          className="w-8 h-8 relative hover:dark:bg-zinc-800 hover:bg-slate-200"
          onClick={() => onTwoSymbolEvt("~~")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={0}
            stroke="currentColor"
            className="w-8 m-auto h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"
            />
          </svg>
        </button>
        <span className="relative h-6 border-[1px] dark:border-gray-500 mx-2" />
        <button
          className="w-8 h-8 relative hover:dark:bg-zinc-800 hover:bg-slate-200"
          onClick={() => onLinkEvt()}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            className="w-8 m-auto h-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"></path>
          </svg>
        </button>
        <button
          className="w-8 h-8 relative hover:dark:bg-zinc-800 hover:bg-slate-200"
          onClick={() => onCodeEvt()}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            className="w-8 m-auto h-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"></path>
          </svg>
        </button>
        <button
          className="w-8 h-8 relative hover:dark:bg-zinc-800 hover:bg-slate-200"
          onClick={() => onOneSymbolEvt(">")}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            className="w-8  h-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"></path>
          </svg>
        </button>
        <label
          htmlFor="image"
          className="cursor-pointer flex items-center w-8 h-8 relative hover:dark:bg-zinc-800 hover:bg-slate-200"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            className="w-8 m-auto h-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path>
          </svg>
          <input
            {...register("image")}
            id="image"
            type="file"
            className="hidden"
            accept="image/*"
          />
        </label>
      </div>
    </div>
  );
};

export default ToolBar;
