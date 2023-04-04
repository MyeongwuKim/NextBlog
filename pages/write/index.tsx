import { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import CDropDown from "@/components/dropDown";
import { isTypeReferenceNode } from "typescript";

/* 
WYSIWYG에디터
  예전 방식 contentEditable,execCommand 활용
  ->deprecated됨...
  ->하지만 여전히 쓴다고한다
/* 
Update History
- 23.2.27 클립보드 작성
- 23.3.13 문단이벤트,복사붙여넣기이벤트,지우기이벤트 작성
- 23.3.14 스크롤 이벤트 작성, 문자열 사이에서 엔터쳤을때 발생했던 버그 수정
- 23.3.15 텍스트영역 클릭이벤트작성, 복사붙여넣기 작성중..
- 23.3.16 복사붙여넣기 완성, tool활성화 체크,
- 23.4.3  스타일변경(크기,볼드,기울임,밑줄), 드랍다운 메뉴 추가, 스타일이벤트적용시 merge이벤트등 추가
*/
/*
-해야할것
1.스타일을 적용시켰을때 앞뒤가 같다면 합친다 -> 태그 낭비를 막기위해,Caret과 Range둘다
2.Caret상태에서 스타일을 새로 적용시킨후 지웠을때 원래대로 합치게함-> 원래상태로 되돌림
 */
//interface//////////
interface IMultiKey {
  ctrl: boolean;
  shift: boolean;
  back: boolean;
}
interface IDropDownItem {
  name: string;
  tag?: any;
  value: string;
  selected: boolean;
}

interface IToolState {
  [key: string]: boolean | number | string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  size: number;
  align: string;
}
/////////////////////
var selection: Selection | null;
var device: string;
var multiKey: IMultiKey = {
  ctrl: false,
  shift: false,
  back: false,
};
var makePrevTag: any;
var firstAlign: string;
var alignIndex: number;
/** 노드타입 변수, TEXT: 3, NODE: 1*/
const type = { TEXT: 3, NODE: 1 };
/** 처음 입력시 막을 키목록, Tab, Arrow, Esc */
const blockKeys: string[] = ["Tab", "Arrow", "Esc"];
////dropdown data ////////////////
const sizeData: IDropDownItem[] = [
  { name: "18", value: "18", selected: false },
  { name: "20", value: "20", selected: false },
  { name: "24", value: "24", selected: false },
  { name: "30", value: "30", selected: false },
  { name: "36", value: "36", selected: false },
  { name: "48", value: "48", selected: false },
];
const alignData: IDropDownItem[] = [
  {
    name: "left",
    value: "left",
    selected: false,
    tag: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5"
        />
      </svg>
    ),
  },
  {
    name: "right",
    value: "right",
    selected: false,
    tag: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25"
        />
      </svg>
    ),
  },
  {
    name: "center",
    value: "center",
    selected: false,
    tag: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
    ),
  },
];
////dropdown data ////////////////
//replace(/<[^>]*>?/g, ''):모든태그제거
const write: NextPage = () => {
  const [toolState, setToolState] = useState<IToolState>({
    bold: false,
    italic: false,
    underline: false,
    size: 18,
    align: "left",
  });
  const router = useRouter();
  const titleArea = useRef<any>();
  const bodyArea = useRef<HTMLDivElement>(null);

  const init = () => {
    alignIndex = 0;
    console.log(alignIndex);
    device = navigator?.userAgent.toLowerCase(); //기기정보
    selection = document.getSelection(); //현재 커서 정보
    makePrevTag = null;

    document.addEventListener("selectionchange", () => {
      if (makePrevTag != selection?.focusNode) {
        removeBlankTag();
      }
      if (selection?.type == "Range") return;
      if (selection?.focusNode?.nodeType == type.TEXT) {
        let coverTag = selection.focusNode.parentNode as HTMLElement;
        let size = parseInt(coverTag.style.fontSize.replace("px", ""));

        if (coverTag && coverTag.nodeName != "P") {
          setToolState((prev) => ({
            ...prev,
            bold: coverTag.style.fontWeight ? true : false,
            italic: coverTag.style.fontStyle ? true : false,
            underline: coverTag.style.textDecoration ? true : false,
            size,
          }));
        } else {
          //텍스트면 초기화
          setToolState({
            ...(toolState && {
              bold: false,
              italic: false,
              underline: false,
              size: 18,
              align: "left",
            }),
          });
        }
      }
    });

    bodyArea?.current?.addEventListener("mouseup", mouseUpEvt);

    // let count = 3;
    // let newRage = document.createRange();
    // for (let i = 0; i < count; i++) {
    //   const { current } = bodyArea;
    //   const pNode: HTMLElement = document.createElement("p");
    //   pNode.innerHTML = `<span data-style="bold;underline" style="text-decoration:underline; font-weight:bold;">oh</span><span data-style="bold" style="font-weight:bold;">span</span><span data-style="bold;underline" style="text-decoration:underline; font-weight:bold;">123</span>`;

    //   current?.append(pNode);
    //   newRage.setStartAfter(pNode);
    //   newRage.collapse(true);
    //   selection?.removeAllRanges();
    // }
  };
  //init
  useEffect(() => {
    init();
  }, []);

  const mouseUpEvt = () => {
    let coverTag = selection?.focusNode?.parentNode as HTMLElement;

    if (coverTag && coverTag.nodeName != "P") {
      setToolState((prev) => ({
        ...prev,
        bold: coverTag.style.fontWeight ? true : false,
        italic: coverTag.style.fontStyle ? true : false,
        underline: coverTag.style.textDecoration ? true : false,
      }));
    } else {
      //텍스트면 초기화
      setToolState({
        ...(toolState && {
          bold: false,
          italic: false,
          underline: false,
          size: 18,
          align: "left",
        }),
      });
    }
  };

  const pasteEvent = () => {
    navigator.clipboard
      .readText()
      .then((result) => {
        const pLength = getTextAreaLength();

        if (pLength! <= 0) {
          let node = createParagraph(false) as HTMLElement;
          node.innerHTML = result;
          selection?.selectAllChildren(node);
          selection?.collapseToEnd();
        } else {
          let pNode = selection?.focusNode as HTMLElement;

          while (true) {
            if (pNode?.nodeName == "P") break;
            else {
              pNode = pNode.parentNode as HTMLElement;
            }
          }

          let focusNode = selection?.anchorNode;
          let focusOffset = selection?.anchorOffset;
          //드래그 부분 삭제
          if (selection?.type == "Range") {
            selection.getRangeAt(0).deleteContents();
            for (let i = 0; i < pNode.childNodes.length; i++) {
              let child = pNode.childNodes[i];
              if (
                child.nodeType == type.NODE &&
                (child as HTMLElement).innerHTML.replace(/<[^>]*>?/g, "")
                  .length <= 0
              ) {
                pNode.removeChild(child);
                i--;
              }
            }
          }

          if (
            !focusNode?.parentNode ||
            (focusNode.parentNode as HTMLElement).innerHTML.replace(
              /<[^>]*>?/g,
              ""
            ).length <= 0 ||
            focusNode.nodeValue?.length! <= 0 ||
            focusNode.nodeValue?.length! == focusOffset
          ) {
            focusNode = null;
          }

          if (pNode.innerHTML.replace("<br>", "").length <= 0) {
            //br밖에 없다면.. 그냥 삽입함
            pNode.innerHTML = result;
            selection?.selectAllChildren(pNode);
            selection?.collapseToEnd();
          } else {
            let lastNode = pNode.lastChild as HTMLElement;

            if (lastNode.nodeType == type.NODE) {
              lastNode = lastNode.lastChild as HTMLElement;
            }
            //커서 시작부분부터 끝 노드까지 드래그
            selection!.setBaseAndExtent(
              selection?.focusNode!,
              selection?.focusOffset!,
              lastNode,
              lastNode.nodeValue?.length!
            );

            let range = selection?.getRangeAt(0);
            let textNode = document.createTextNode(result);
            let docNode = selection?.getRangeAt(0)?.extractContents(); //드래그된 부분을 잘라냄

            docNode = getClearDocNode(docNode!);

            for (let i = 0; i < docNode?.childNodes.length!; i++) {
              let child = docNode?.childNodes[i]!;
              if (
                child.nodeType == type.NODE &&
                (child as HTMLElement).innerHTML.replace(/<[^>]*>?/g, "")
                  .length <= 0
              ) {
                docNode!.removeChild(child);
                i--;
              }
            }

            pNode?.appendChild(textNode); //복사해온 문자를 생성후 삽입
            selection?.getRangeAt(0).selectNode(textNode);

            //잘라내기한 값을 삽입하면 range상태이기 때문에 끝부분으로 접고 돌면서 삽입

            while (docNode!.childNodes.length > 0) {
              range?.collapse(false);
              if (focusNode && focusNode?.parentNode?.nodeName == "SPAN") {
                let cloneNode = focusNode.parentNode.cloneNode(
                  true
                ) as HTMLElement;
                cloneNode.innerHTML = !(docNode!.firstChild as HTMLElement)
                  .innerHTML
                  ? docNode!.firstChild?.nodeValue!
                  : (docNode!.firstChild as HTMLElement).innerHTML!;
                docNode?.removeChild(docNode!.firstChild as Node);
                range?.insertNode(cloneNode);
                focusNode = null;
              } else range?.insertNode(docNode!.firstChild as Node);
            }

            //복사한값을 선택하고 끝부분으로 커서를 접음
            range?.selectNodeContents(textNode);
            range?.collapse(false);
          }

          //잘라내기를 끝마치고 빈 span을 정리
          for (let i = 0; i < pNode.childNodes.length; i++) {
            let child = pNode.childNodes[i];
            if (
              child.nodeType == type.NODE &&
              (child as HTMLElement).innerHTML.replace(/<[^>]*>?/g, "")
                .length <= 0
            ) {
              pNode.removeChild(child);
              i--;
            }
          }
        }
      })
      .catch((err) => {
        console.error("wrong read", err);
      });
  };
  /**바깥쪽 태그스타일을 그대로 복사해서 새 노드에 감싼다*/
  const surroundStyleTag = (outerTag: HTMLElement, target: Node) => {
    let span = document.createElement("span");
    let styleData = `${
      outerTag.style.fontWeight.trim().length > 0
        ? outerTag.style.fontWeight
        : ""
    }
    ${
      outerTag.style.textDecoration.trim().length > 0
        ? `text-decoration:${outerTag.style.textDecoration}`
        : ""
    }
    ${
      outerTag.style.fontStyle.trim().length > 0
        ? `font-style:${outerTag.style.fontStyle}`
        : ""
    }
    font-size:${outerTag.style.fontSize}
    `;

    span.setAttribute("style", getFormatStyle(styleData));
    span.setAttribute("data-style", getFormatDataStyle(styleData));
    selection?.getRangeAt(0).selectNode(target);
    selection?.getRangeAt(0).surroundContents(span);
  };
  /**태그에 스타일만 적용함 */
  const setTagStyle = (
    evtAction: string,
    evtState: boolean,
    insertNode: HTMLElement,
    originNode?: HTMLElement | void
  ) => {
    let styleData = "";
    if (originNode?.parentElement?.nodeName == "SPAN") {
      styleData = originNode?.parentElement?.style.cssText;
    }
    styleData = `${
      evtAction == "bold" && evtState
        ? "font-weight:bold;"
        : `${
            evtAction != "bold" && styleData.indexOf("bold") > -1
              ? "font-weight:bold;"
              : ""
          }`
    } ${
      evtAction == "underline" && evtState
        ? "text-decoration:underline;"
        : `${
            evtAction != "underline" && styleData.indexOf("underline") > -1
              ? "text-decoration:underline;"
              : ""
          }`
    } ${
      evtAction == "italic" && evtState
        ? "font-style:italic;"
        : `${
            evtAction != "italic" && styleData.indexOf("italic") > -1
              ? "font-style:italic;"
              : ""
          }`
    } ${
      evtAction == "size"
        ? `font-size:${evtState}px;`
        : `font-size:${originNode?.parentElement?.style.fontSize}`
    }`;

    if (styleData.length > 0) {
      insertNode.setAttribute("style", getFormatStyle(styleData));
      insertNode.setAttribute("data-style", getFormatDataStyle(styleData));
    }
  };
  /**스타일 적용이벤트 */
  const onStyleEvent = (
    toolState: IToolState,
    evtAction: string,
    evtState: any
  ) => {
    if (selection?.type == "None") {
      let textArea = document.getElementById("editor_TextArea");
      let lastP = textArea?.lastChild as HTMLElement;
      textArea?.focus();
      if (lastP) {
        let last = lastP?.lastChild!;
        if (last.nodeName != "BR" && last?.nodeType == type.NODE) {
          last = last.lastChild!;
        }
        selection?.setBaseAndExtent(
          last,
          last?.nodeValue?.length!,
          last,
          last?.nodeValue?.length!
        );
      }
      mouseUpEvt();
    } else if ((selection?.focusNode as HTMLElement)?.id == "editor_title") {
      return;
    }

    if (!getIsDefaultStyle(toolState)) removeBlankTag();

    setToolState(toolState);

    let anchor = selection?.focusNode;
    let pNode = anchor;

    if (getTextAreaLength() <= 0) {
      bodyArea.current?.setAttribute("style", `text-align:${evtState};`);

      bodyArea.current?.focus();
      return;
    }

    if (pNode?.nodeName != "DIV") {
      while (true) {
        if (pNode == undefined) {
          break;
        }
        if (pNode?.nodeName == "P") {
          break;
        } else {
          pNode = pNode?.parentNode as HTMLElement;
        }
      }
    }
    if (evtAction == "align") {
    }
    if (selection?.type == "Caret") {
      let insertTag: Text | HTMLElement;
      if (getIsDefaultStyle(toolState)) {
        insertTag = document.createTextNode("");
        insertTag.textContent = "\u200B";
      } else {
        insertTag = document.createElement("span");
        insertTag.innerHTML = "\u200B";
        setTagStyle(
          evtAction,
          evtState,
          insertTag,
          selection.focusNode as HTMLElement
        );
      }

      selection.getRangeAt(0).insertNode(insertTag);

      //커서 위치가 Text(no style)에 있을때 부모가 P여서 예외처리함
      let outerTag = insertTag.parentNode as HTMLElement;

      if (
        insertTag.previousSibling?.nodeValue?.length! > 0 &&
        insertTag.previousSibling?.parentNode?.nodeName != "P"
      ) {
        surroundStyleTag(outerTag, insertTag.previousSibling!);
      }
      if (
        insertTag.nextSibling?.nodeValue?.length! > 0 &&
        insertTag.nextSibling?.parentNode?.nodeName != "P"
      ) {
        surroundStyleTag(outerTag, insertTag.nextSibling!);
      }
      while (outerTag.childNodes.length > 0 && outerTag.tagName != "P") {
        let child = outerTag.firstChild;
        if (child?.nodeType == type.NODE) child = child.lastChild;
        if (child?.nodeValue?.length! > 0)
          outerTag.before(outerTag.firstChild!);
        else outerTag.removeChild(child!);
      }

      if (outerTag.tagName != "P") outerTag.remove();
      //스타일이 없다면 굳이 머지를 할필요가 없다
      if (insertTag.parentNode?.nodeName != "P")
        insertTag = mergeSameTag(insertTag as HTMLElement) as HTMLElement;
      if (insertTag && (insertTag as HTMLElement).nodeName == "SPAN")
        insertTag = insertTag.lastChild as HTMLElement;

      selection.setBaseAndExtent(insertTag!, 1, insertTag!, 1);
      makePrevTag = insertTag;
    } else if (selection?.type == "Range") {
      let startContainer = selection.getRangeAt(0).startContainer as Node;
      let endContainer = selection.getRangeAt(0).endContainer as Node;
      let commoncontainer = selection.getRangeAt(0).commonAncestorContainer;

      let oriStartOffset = selection.getRangeAt(0).startOffset;
      let oriEndOffset = selection.getRangeAt(0).endOffset;

      let startParagraph = getCurentParagraph(startContainer);
      let endParagraph = getCurentParagraph(endContainer);
      let endParagraphNext = endParagraph?.nextSibling;

      let iteratorParagraph = startParagraph;
      let iteratorContainer: Node | null = startContainer;
      let iteratorEnd = false;
      let iteratorStart = false;
      let isCollapse = false;
      //드래그 시작부분부터 끝까지 태그를 순회한다
      while (true) {
        if (iteratorEnd) break;
        //nextNode가 null이라면 다음 P노드 첫번째 자식노드로 설정해서 다시 순회
        if (!iteratorContainer) {
          iteratorParagraph = iteratorParagraph.nextSibling as Node;
          iteratorContainer = iteratorParagraph?.firstChild as Node;
        }

        if (
          !iteratorParagraph ||
          iteratorParagraph == endParagraphNext ||
          isCollapse
        )
          break;
        //순회를 끝마쳤다면 종료
        if (
          iteratorContainer === endContainer ||
          iteratorContainer.lastChild === endContainer
        ) {
          iteratorEnd = true;
          iteratorStart = false;
        } else if (
          iteratorContainer === startContainer ||
          iteratorContainer.lastChild === startContainer
        ) {
          iteratorStart = true;
        } else {
          iteratorStart = false;
        }

        let targetNode = (
          iteratorContainer.nodeName == "SPAN"
            ? iteratorContainer.lastChild
            : iteratorContainer
        ) as Node;

        let startOffset = 0;
        let endOffset = targetNode.nodeValue?.length!;
        if (iteratorEnd) {
          startOffset = 0;
          endOffset = oriEndOffset;
        } else if (iteratorStart) {
          startOffset = oriStartOffset;
        }
        if (
          commoncontainer.nodeName != "P" &&
          commoncontainer.nodeName != "DIV"
        ) {
          isCollapse = true;
          startOffset = oriStartOffset;
          endOffset = oriEndOffset;
        }
        //태그 정보가 바뀌어도 next는 그대로 유지할수있게
        if (iteratorContainer.parentNode?.nodeName == "SPAN") {
          iteratorContainer = iteratorContainer.parentNode.nextSibling as Node;
        } else iteratorContainer = iteratorContainer.nextSibling as Node;

        selection.setBaseAndExtent(
          targetNode,
          startOffset,
          targetNode,
          endOffset
        );
        let focusNode = selection.focusNode;
        let textValue = focusNode?.nodeValue!.substring(
          selection.anchorOffset,
          selection.focusOffset
        );
        let insertTag: HTMLElement;

        //적용된 스타일이 있으면 Span
        insertTag = document.createElement("span");
        insertTag.innerText = textValue!;
        setTagStyle(evtAction, evtState, insertTag, focusNode as HTMLElement);

        selection.getRangeAt(0).deleteContents();
        selection.getRangeAt(0).insertNode(insertTag);

        if (!insertTag.getAttribute("data-style")) {
          let text = insertTag.lastChild!;
          insertTag.before(text);
          insertTag.remove();
          insertTag = text as HTMLElement;
        }
        /*드래그한 태그에 next나 prev가 있다면, 감싸고있는 태그의 스타일을 적용시킨후 앞쪽으로 빼낸다*/
        if (insertTag?.parentNode?.nodeName == "SPAN") {
          let outerTag = insertTag.parentNode as HTMLElement;

          if (insertTag.previousSibling?.nodeValue?.length! > 0) {
            surroundStyleTag(outerTag, insertTag.previousSibling!);
          }
          if (insertTag.nextSibling?.nodeValue?.length! > 0) {
            surroundStyleTag(outerTag, insertTag.nextSibling!);
          }
          while (outerTag.childNodes.length > 0) {
            let child = outerTag.firstChild;
            if (child?.nodeType == type.NODE) child = child.lastChild;
            if (child?.nodeValue?.length! > 0)
              outerTag.before(outerTag.firstChild!);
            else outerTag.removeChild(child!);
          }
          outerTag.remove();
          //태그 정보가 변경 되었을때 한번 저장, merge전
          if (isCollapse) {
            startContainer = insertTag;
            endContainer = insertTag;
          } else {
            if (iteratorStart) {
              startContainer = insertTag;
            } else if (iteratorEnd) {
              endContainer = insertTag;
            }
          }
          //현재 삽입된 태그 다음이 마지막인지 체크
          // if (
          //   insertTag.nextSibling == endContainer ||
          //   insertTag.nextSibling?.lastChild == endContainer
          // ) {
          //   debugger;
          //   endContainer = insertTag.nextSibling;
          // }
          // let mergeInsertTag = mergeRangeSameTag(
          //   insertTag,
          //   startContainer,
          //   endContainer
          // );

          //합쳐진 태그가있다면 insert정보를 바꿔주고 순회컨테이너 정보를 합친태그의 다음태그로 바꿔줌
          //합친뒤 시작컨테이너,끝컨테이너 체크..
          // if (mergeInsertTag) {
          //   insertTag = mergeInsertTag;
          //   if (
          //     !mergeInsertTag.nextSibling &&
          //     endParagraph == iteratorParagraph
          //   ) {
          //     iteratorEnd = true;
          //     iteratorContainer = null;
          //   } else if (
          //     !mergeInsertTag.nextSibling &&
          //     startParagraph == iteratorParagraph
          //   ) {
          //     iteratorContainer = null;
          //   } else if (!mergeInsertTag.nextSibling) {
          //     iteratorContainer = null;
          //   }
          // }
        }
        //스타트 태그,엔드태그 정보 변경
        if (isCollapse) {
          //드래그 했을때 end와 start가 같다면
          startContainer = insertTag;
          endContainer = insertTag;
        } else {
          if (iteratorStart) {
            startContainer = insertTag;
          } else if (iteratorEnd) {
            endContainer = insertTag;
          }
        }
      }

      if (endContainer.nodeType == type.NODE) {
        endContainer = endContainer.lastChild!;
      }
      if (startContainer.nodeType == type.NODE) {
        startContainer = startContainer.lastChild!;
      }

      iteratorParagraph = startParagraph;
      while (true) {
        if (
          !iteratorParagraph ||
          iteratorParagraph == endParagraphNext ||
          isCollapse
        )
          break;
        else {
          let checkTag = iteratorParagraph.firstChild as HTMLElement;
          if (
            checkTag.nodeType == type.TEXT &&
            checkTag.parentNode?.nodeName == "SPAN"
          ) {
            checkTag = checkTag.parentNode as HTMLElement;
          }
          mergeRangeSameTag(checkTag!);
          iteratorParagraph = iteratorParagraph.nextSibling as Node;
        }
      }

      selection.setBaseAndExtent(
        startContainer,
        0,
        endContainer,
        endContainer.nodeValue?.length!
      );
    }
  };
  //타이틀영역을 스크롤영역만큼 늘린다
  const onTitleChange = (e: any) => {
    const { current } = titleArea;
    current!.style.height = "auto";
    current!.style.height = current!.scrollHeight + "px";
  };

  // const clipBoardUpdate = () => {
  //   console.log("!!");
  //   /*복사해온 텍스트를 클립보드에서 읽은후 다시 Write한다 (태그복사방지)
  //   Read()함수는 복사해온 데이터 형태를 볼수있다
  //   Write()는 데이터형태를 지정해서 클립보드에 저장할수있다(이미지,태그등)
  //   */
  //   navigator.clipboard
  //     .readText()
  //     .then((resultText) => {
  //       console.log(resultText);
  //       let node = `<p>${resultText}</p>`;
  //       const type = "text/html";
  //       const blob = new Blob([node], { type });
  //       navigator.clipboard
  //         .write([
  //           new ClipboardItem({
  //             ["text/html"]: blob,
  //           }),
  //         ])
  //         .then(() => {
  //           //if (eventName != "focus") clipBoardRead();
  //         })
  //         .catch((err) => {
  //           console.error("Wrong Write");
  //         });
  //     })
  //     .catch((err) => {
  //       console.error("wrong Read Text");
  //     });
  // };

  /**커서가 문자열 사이에 있다면**/
  const caretInStringEvent = (): string | void => {
    let anchor = selection?.focusNode;
    let anchorOffset = selection?.focusOffset;
    let pNode = anchor;

    if (pNode?.nodeName != "DIV") {
      while (true) {
        if (pNode?.nodeName == "P") break;
        else {
          pNode = pNode?.parentNode as HTMLElement;
        }
      }
    }

    let lastNode = pNode.lastChild as HTMLElement;
    let cloneNode: HTMLElement;
    let anchorParent: HTMLElement;
    /*
      style복사용 노드, extractContents로 자를때 span안에있다면 text만 잘라와서 만듬
      커서안에있는 노드타입이 Text면 부모 엘리먼트를 찾아본다
      부모 엘리트먼트가 있고 P의 마지막 노드가 Text가 아닐때 
    */
    if (anchor?.nodeType == type.TEXT) {
      anchorParent = anchor.parentElement!;
      if (anchorParent && anchorParent.tagName != "P") {
        if (anchorParent === lastNode) {
          cloneNode = lastNode.cloneNode(true) as HTMLElement;
        }
      }
    }
    //타입이 노드면 안에있는 text객체를 찾음
    if (lastNode.nodeType == type.NODE) {
      lastNode = lastNode.lastChild as HTMLElement;
    }

    selection!.setBaseAndExtent(
      anchor!,
      anchorOffset!,
      lastNode,
      lastNode.nodeValue?.length!
    );

    let docNode = selection?.getRangeAt(0).extractContents();
    let commonNode = selection?.getRangeAt(0).commonAncestorContainer;
    commonNode?.childNodes.forEach((node: any) => {
      //type 1 is Element, Text is 3
      if (node.nodeType == type.NODE) {
        if (node.innerHTML.length <= 0) commonNode?.removeChild(node);
      }
    });
    let newNode = "";

    docNode?.childNodes.forEach((node: any) => {
      if (node.nodeType == type.NODE) {
        if (node.innerHTML.length > 0) {
          newNode += node.outerHTML;
        }
      } else if (node.nodeType == type.TEXT) {
        newNode += node.nodeValue;
      }
    });

    if (cloneNode!) {
      cloneNode.innerHTML = newNode;
      newNode = cloneNode.outerHTML;
    }
    return newNode;
  };
  //삭제 이벤트
  const removeEvent = (e: React.KeyboardEvent) => {
    let [pNodeLength, caretOffset] = paragraphInfo();
    const { current } = bodyArea;
    let bodypNodeLength = current?.getElementsByTagName("p").length;
    let currentNode = selection?.focusNode as HTMLElement;

    if (currentNode.nodeName == "DIV") return;
    // if (caretOffset >= 1 && caretOffset <= pNodeLength) return;
    while (true) {
      if (currentNode?.nodeName == "P") break;
      else {
        currentNode = currentNode.parentNode as HTMLElement;
      }
    }
    let prevNode = currentNode.previousSibling as HTMLElement;

    //드래그 지우기
    if (selection?.type == "Range") {
      let anchorNode = selection.anchorNode;

      selection.getRangeAt(0).deleteContents();

      /*
      지웠을때 커서가 가리키고있는 노드의 값이 없으면서 SPAN이면
      anchorNode의 값을 prev노드로 바꾸고 지운다
      */
      if (
        anchorNode?.nodeValue?.length! <= 0 &&
        anchorNode?.parentNode?.nodeName == "SPAN"
      ) {
        anchorNode = anchorNode?.parentNode.previousSibling;
        if (anchorNode?.parentNode?.nodeName == "SPAN") {
          anchorNode.parentNode.nextSibling?.remove();
        } else anchorNode?.nextSibling?.remove();
      }

      selection.selectAllChildren(currentNode);
      let docNode = selection.getRangeAt(0).extractContents();
      selection.getRangeAt(0).setStartAfter(anchorNode!);
      selection.getRangeAt(0).setEndAfter(anchorNode!);

      docNode = getClearDocNode(docNode!);

      let targetNode = anchorNode as HTMLElement;
      //잘라온 노드들을 커서를 앞으로 보내가며 붙여줌
      while (docNode.childNodes.length > 0) {
        let child = docNode.firstChild;
        targetNode.after(child!);
        selection.getRangeAt(0).setEndAfter(child!);
        targetNode = child as HTMLElement;
      }
      //selection.getRangeAt(0).setEndAfter(anchorNode!);
      if (anchorNode?.nodeName == "SPAN") {
        anchorNode = anchorNode?.lastChild;
      }
      //커서세팅
      selection.setBaseAndExtent(
        anchorNode!,
        anchorNode?.nodeValue?.length!,
        anchorNode!,
        anchorNode?.nodeValue?.length!
      );
      e.preventDefault();
    } else if (selection?.type == "Caret") {
      //한칸밖에없음..
      if (!prevNode && caretOffset == 1) {
        current?.childNodes[0].remove();
      } else if (caretOffset <= 0) {
        //커서가 맨끝에 위치해 있다면
        if (!prevNode) {
          return;
        } //위에 다른 노드가 없으면 리턴
        if (prevNode.innerHTML.replace(/<[^>]*>?/g, "").length <= 0) {
          //위에 다른 노드가 있고 값이 아무것도 없다면, 위의 노드를 삭제(위로당긴다)
          current?.removeChild(prevNode);
          //아무값 없는 P노드를 지운후 body에 한칸만 남아있는 상태라면 체크함
          if (
            pNodeLength == 1 &&
            (current?.childNodes[0] as HTMLElement).innerHTML.replace(
              "<br>",
              ""
            ).length <= 0
          ) {
            current?.childNodes[0].remove();
          }
          e.preventDefault();
          return;
        } else {
          //위에 다른 노드가 있고 값이 있다면, 위의 노드랑 합침
          let offset: number = prevNode.lastChild?.nodeValue?.length!;
          let offsetNode = prevNode.lastChild;

          if (prevNode.lastChild?.nodeType == type.NODE) {
            let node = prevNode.lastChild as HTMLElement;
            offsetNode = node.lastChild;
            offset = offsetNode?.nodeValue?.length!;
          }

          selection?.setBaseAndExtent(offsetNode!, offset, offsetNode!, offset);

          while (currentNode.childNodes.length > 0) {
            let child = currentNode.firstChild;
            let childoffset = child?.nodeValue?.length;

            if (child?.nodeType == type.NODE) {
              childoffset = child.lastChild?.nodeValue?.length;
            }

            selection?.getRangeAt(0).insertNode(child!);
            selection?.getRangeAt(0)?.selectNodeContents(child!);
            selection?.getRangeAt(0).collapse(false);
          }
          selection?.setBaseAndExtent(offsetNode!, offset, offsetNode!, offset);
          selection?.getRangeAt(0).collapse(true);
          current?.removeChild(currentNode);
        }
        e.preventDefault();
      } else if (caretOffset == 1 && !prevNode) {
        /*지울때 prevNode가 없고, caretOffset이 1일때 : P태그가 하나남았고, 문자열 한개를 지우기전에
      태그를 날려준다,
    */
        // current?.removeChild(currentNode);
        // e.preventDefault();
      }
    }
    // for (let i = 0; i < bodyArea?.current?.childNodes.length!; i++) {
    //   let child = bodyArea?.current?.childNodes[i] as HTMLElement;
    //   if (child.innerHTML.replace(/<[^>]*>?/g, "").length <= 0) {
    //     bodyArea?.current?.removeChild(child);
    //     i--;
    //   }
    // }
  };
  //문단만들기
  const createParagraph = (isFirstInput: boolean): Node | void => {
    const { current } = bodyArea;
    current?.removeAttribute("style");
    const pNode: HTMLElement = document.createElement("p");

    let [pNodeLength, caretOffset] = paragraphInfo();
    let insertEvent: InsertPosition = "afterbegin"; //beforebegin:앞에, afterend:뒤에
    let cursorStay: boolean = false;
    let currentNode = selection?.focusNode as HTMLElement;
    let pStyleData = `text-align:${toolState.align};`;

    pNode.setAttribute("style", getFormatStyle(pStyleData));
    pNode.setAttribute("data-style", getFormatDataStyle(pStyleData));

    if (getIsDefaultStyle(toolState)) pNode.innerHTML = "<br>";
    else {
      pNode.innerHTML = `<span></span>`;
      let child = pNode.firstChild as HTMLElement;
      child.innerHTML = "<br>";
      let styleData = `${toolState.bold ? "font-weight:bold;" : ""} ${
        toolState.underline ? "text-decoration:underline;" : ""
      } ${toolState.italic ? "font-style:italic;" : ""} font-size:${
        toolState.size + "px"
      }`;
      child.setAttribute("style", getFormatStyle(styleData));
      child.setAttribute("data-style", getFormatDataStyle(styleData));
    }

    if (currentNode.nodeName != "DIV") {
      while (true) {
        if (currentNode?.nodeName == "P") break;
        else {
          currentNode = currentNode.parentNode as HTMLElement;
        }
      }
    }
    //가리키는 커서에 값이 있다면..
    if (
      selection?.focusNode?.nodeValue ||
      (selection?.focusNode as HTMLElement).innerHTML.length > 0
    ) {
      /*커서가 드래그 되어있다 -> 드래그된 값을 삭제한다*/
      if (selection?.type == "Range") {
        selection.getRangeAt(0).deleteContents();
        insertEvent = "afterend";
      }
      //드래그가 되어있지 않다
      else if (selection?.type == "Caret") {
        if (caretOffset <= 0) {
          //커서가 맨앞에 있다 -> 커서를 그대로 두고 커서 위에 노드생성
          cursorStay = true;
          insertEvent = "beforebegin";
        } else if (caretOffset < pNodeLength) {
          //커서가 중간에 있다 -> 커서가 위치한 앞에 텍스트를 자르고, 자른값을 삽입한 노드에 넣는다, 그리고 아래로 커서이동
          insertEvent = "afterend";
          pNode.innerHTML = caretInStringEvent() as string;
        } else if (caretOffset == pNodeLength) {
          //커서가 맨끝에 있다 -> 커서 바로 아래 노드를 생성하고 생성한 노드에 커서를 둔다
          insertEvent = "afterend";
        }
      }
    } else if (
      selection?.focusNode?.nodeName != "DIV" &&
      !selection?.focusNode?.nodeValue &&
      pNodeLength >= 1
    ) {
      insertEvent = "beforebegin";
      cursorStay = true;
    }
    //에디터에 아무런 값이 없다면  append함
    if (getTextAreaLength() <= 0) {
      current?.append(pNode);
    } else currentNode.insertAdjacentElement(insertEvent, pNode);

    //커서가 stay여야만 할때, 커서 이동X
    if (!cursorStay) {
      selection?.getRangeAt(0).selectNode(pNode);
      selection?.collapseToStart();
      selection?.setBaseAndExtent(
        pNode.childNodes[0],
        0,
        pNode.childNodes[0],
        0
      );
    }
    //비어있는 <p> 정리
    for (let i = 0; i < current?.childNodes.length!; i++) {
      let childP = current?.childNodes[i] as ChildNode;
      if (
        (childP as HTMLElement).innerHTML.replace(
          /<(\/span|span)([^>]*)>/gi,
          ""
        ).length <= 0
      ) {
        current?.removeChild(childP);
        i--;
      }
    }

    if (isFirstInput) createParagraph(false);

    scrollEvent();

    return pNode;
  };

  //스크롤 이벤트, 커서가 위치한 문자열이 맨 아래에서 안나가게함
  const scrollEvent = () => {
    let editScroll = document.getElementById("editor_scroll") as HTMLElement;
    let currentNode = selection?.focusNode as HTMLElement;

    //scrollHeight :  영역 맨아래 값
    //scrollTop :스크롤이 움직인 값,
    if (currentNode.nodeName != "DIV") {
      while (true) {
        if (currentNode?.nodeName == "P") break;
        else {
          currentNode = currentNode.parentNode as HTMLElement;
        }
      }
    }

    let prevP = currentNode.previousSibling as HTMLElement;
    let pTotalHeight = 28;
    if (prevP) {
      let swapPrevP = prevP;
      while (true) {
        pTotalHeight += swapPrevP.clientHeight;
        if (swapPrevP.previousSibling)
          swapPrevP = swapPrevP.previousSibling as HTMLElement;
        else break;
      }
    }

    /*현재 가리키고있는 커서의 노드 오프셋(바디안의 절대포지션)이 스크롤영역 높이 + 스크롤을 감은 값(오프셋)
    보다 커지면 현재 가리키고있는 커서 위에 있는 모든 노드의 높이값을 더한 값에 스크롤영역높이를 빼준만큼
    스크롤을 이동시킨다 
    */
    if (
      currentNode.offsetTop >=
      editScroll?.clientHeight + editScroll.scrollTop
    ) {
      editScroll.scrollTo(0, pTotalHeight - editScroll?.clientHeight);
    }
  };
  //GET///////////////////////////////////////////////////////////////////////////////////
  /**인자값을 Style이 적용될 값으로 포맷후 리턴*/
  const getFormatStyle = (data: string): string => {
    return data
      .replace(/\n|\r|\s*/g, "")
      .split(";")
      .filter((str) => {
        if (str.trim().length > 0) {
          return str;
        }
      })
      .join(";")
      .trim();
  };
  /**인자값을 data-Style에 입력될 값으로 포맷후 리턴*/
  const getFormatDataStyle = (data: string): string => {
    return data
      .split(";")
      .map((style) => {
        if (style.indexOf(":") > -1) {
          return style.substring(style.indexOf(":") + 1);
        }
      })
      .join(";");
  };
  /**문단안에있는 문자열 길이, 커서 오프셋 리턴*/
  const paragraphInfo = (): [number, number] => {
    let ragne = selection?.getRangeAt(0);
    let focusOffset = selection?.focusOffset!;
    let focusNode = selection?.focusNode as Node;
    let pNode = focusNode?.parentNode as HTMLElement;
    let caretOffset = 0;

    if (focusNode.nodeName == "P") {
      pNode = focusNode as HTMLElement;
    } else if (focusNode?.parentNode?.nodeName != "P") {
      pNode = focusNode?.parentNode as HTMLElement;
      while (true) {
        if (pNode?.parentNode?.nodeName == "DIV") {
          break;
        } else {
          pNode = pNode?.parentNode as HTMLElement;
        }
      }
    }

    selection?.setBaseAndExtent(
      pNode.firstChild as Node,
      0,
      focusNode,
      focusOffset
    );

    selection
      ?.getRangeAt(0)
      .cloneContents()
      .childNodes.forEach((node: any) => {
        if (node.nodeType == type.TEXT) caretOffset += node?.nodeValue!.length;
        else if (node.nodeType == type.NODE) {
          caretOffset += node?.innerText!.length;
        }
      });

    //selection?.setBaseAndExtent(focusNode, focusOffset, focusNode, focusOffset);
    selection?.removeAllRanges();
    selection?.addRange(ragne!);
    //br은 1로 취급
    return [pNode.innerText.length, caretOffset];
  };
  /**TextArea P태그 갯수  */
  const getTextAreaLength = (): number => {
    return bodyArea?.current?.getElementsByTagName("P").length!;
  };
  /**해당 노드가 속한 P태그를 리턴  */
  const getCurentParagraph = (node: Node) => {
    let paragraphTag = node;
    while (true) {
      if (paragraphTag.nodeName == "P") break;
      else paragraphTag = paragraphTag.parentNode as Node;
    }
    return paragraphTag;
  };
  /**아무런 스타일이 지정되어있지않다면 true , 아니면 false  */
  const getIsDefaultStyle = (toolState: IToolState): boolean => {
    let stylecheck = 0;
    let styleLength = Object.keys(toolState).length;
    Object.keys(toolState).forEach((styleName) => {
      if (!toolState[styleName]) {
        stylecheck++;
      }
    });
    return stylecheck == styleLength ? true : false;
  };
  /**잘라낸값에 빈 span값들을 정리해서 리턴(위치한 커서가 span의 끝이면 아무값이 안든
   * span태그를 잘라오기때문에 제거해준다)
   */
  const getClearDocNode = (swapDocNode: DocumentFragment) => {
    for (let i = 0; i < swapDocNode?.childNodes.length!; i++) {
      let child = swapDocNode?.childNodes[i]!;
      if (
        child.nodeType == type.NODE &&
        (child as HTMLElement).innerHTML.replace(/<[^>]*>?/g, "").length <= 0
      ) {
        swapDocNode!.removeChild(child);
        i--;
      }
    }
    return swapDocNode;
  };
  //GET///////////////////////////////////////////////////////////////////////////////////
  //텍스트가 바디에 들어가기전에 작동함
  const onTextAreaKeyDown = (e: React.KeyboardEvent) => {
    const { current } = bodyArea;
    const pLength = getTextAreaLength();
    if (multiKey.ctrl) {
      if (e.key == "c") {
      }
      if (e.key == "v") {
        pasteEvent();
        e.preventDefault();
      }
      if (e.key == "Shift") {
        console.log(selection?.getRangeAt(0));
        console.log(selection!.getRangeAt(0).startOffset);
        console.log(selection!.getRangeAt(0).endOffset);
        // document.execCommand("bold", false);
        // onStyleEvent();
      }
    } else if (!multiKey.ctrl) {
      if (e.key == "Backspace") {
        removeEvent(e);
        multiKey.back = true;
      } else if (e.key == "Shift") {
        multiKey.shift = true;
      } else if (e.key == "Enter") {
        if (pLength! <= 0) createParagraph(true);
        else createParagraph(false);
        e.preventDefault();
      } else if (device.indexOf("mac") > -1 && e.key == "Meta") {
        multiKey.ctrl = true;
      } else {
        if (pLength! <= 0) {
          //첫번재 입력때 해당키가 있으면 키입력 블락
          let isBlock = false;
          blockKeys.forEach((key) => {
            if (e.key.includes(key)) {
              isBlock = true;
              return false;
            }
          });

          if (isBlock) {
            e.preventDefault();
            return;
          }
          createParagraph(false);
        } else {
          //스타일 없는 텍스트 입력시, Arrow이벤트가 들어오면 블랭크 삭제
          if (e.key.indexOf("Arrow") > -1) {
            removeBlankTag();
          }
        }
      }
    }
  };

  const removeBlankTag = () => {
    let focusNode = makePrevTag;
    if (!focusNode) return;
    if (focusNode?.nodeName == "SPAN") {
      focusNode = focusNode.lastChild as HTMLElement;
    }
    if (focusNode!.nodeValue!.indexOf("\u200B") > -1) {
      //selection.setBaseAndExtent(focusNode, index, focusNode, index);
      let styleSpan = focusNode;
      if (styleSpan?.parentNode?.nodeName == "SPAN")
        styleSpan = styleSpan.parentNode;

      let prevTag = styleSpan?.previousSibling as HTMLElement;
      // selection.getRangeAt(0).deleteContents();
      //스타일 태그가있고 기본공백값을 빼고 아무런 텍스트가 없을때 체크
      if (styleSpan) {
        if (
          (styleSpan as HTMLElement).innerHTML.replace("\u200B", "").length > 0
        ) {
          (styleSpan as HTMLElement).innerHTML = (
            styleSpan as HTMLElement
          ).innerHTML.replace("\u200B", "");
        } else (styleSpan as HTMLElement).remove();
      }
      mergeSameTag(prevTag);
      makePrevTag = null;
    }
  };
  /**Range된 모든 문단의 태그를 검사해서 합쳐줌*/
  const mergeRangeSameTag = (tag: HTMLElement): void => {
    while (true) {
      if (tag) {
        let iterator = tag.nextSibling as HTMLElement;
        if (!iterator) break;

        if (
          iterator &&
          iterator.nodeType != type.TEXT &&
          tag?.getAttribute("data-style") ==
            iterator?.getAttribute("data-style")
        ) {
          let commonTag = document.createElement("span");
          commonTag.style.cssText = iterator?.style.cssText!;
          commonTag.setAttribute(
            "data-style",
            iterator?.getAttribute("data-style")!
          );
          iterator?.before(commonTag);

          while (tag.childNodes.length > 0) {
            commonTag.appendChild(tag.firstChild!);
          }
          commonTag.appendChild(iterator.lastChild!);

          tag.remove();
          iterator.remove();
          tag = commonTag;
        } else {
          tag = tag.nextSibling as HTMLElement;
        }
      }
    }
  };
  /**앞뒤로 순회하면서 태그 속성이 같다면 합침(data-style로 체킹) */
  const mergeSameTag = (tag: HTMLElement): HTMLElement | void => {
    if (tag?.parentNode?.nodeName == "P" && tag.nodeType == type.TEXT) return;
    let count = 0;

    while (count < 2) {
      if (tag) {
        let iterator = tag.previousSibling as HTMLElement;
        if (count == 1) iterator = tag.nextSibling as HTMLElement;
        if (!iterator) break;
        if (
          iterator.nodeType != type.TEXT &&
          tag?.getAttribute("data-style") ==
            iterator?.getAttribute("data-style")
        ) {
          let commonTag = document.createElement("span");
          commonTag.style.cssText = iterator?.style.cssText!;
          commonTag.setAttribute(
            "data-style",
            iterator?.getAttribute("data-style")!
          );

          iterator?.before(commonTag);

          if (count == 1)
            commonTag.innerHTML = tag.innerHTML + iterator.innerHTML;
          else commonTag.innerHTML = iterator.innerHTML + tag.innerHTML;

          tag.remove();
          iterator.remove();
          tag = commonTag;
        }
      }
      count++;
    }

    return tag!;
  };
  const onTextAreaKeyUp = (e: React.KeyboardEvent) => {
    if (device.indexOf("mac") > -1 && e.key == "Meta") {
      multiKey.ctrl = false;
    }
    if (multiKey.back) {
      multiKey.back = false;
    }
    if (multiKey.shift) {
      multiKey.shift = false;
    }
  };

  return (
    <div className="flex justify-center w-full h-full">
      <div className="flex-[0.45_1_0%] flex-col flex h-full">
        <div className="flex scroll-auto flex-col dark:bg-zinc-900 min-w-[500px] h-[calc(100%-60px)]">
          <div
            id="editor_title"
            className="select-none relative h-auto max-h-[50%]"
          >
            <textarea
              tabIndex={1}
              rows={1}
              ref={titleArea}
              onChange={onTitleChange}
              placeholder="제목을 입력해주세요.."
              className={`my-4 relative overflow-auto w-full p-0 px-4
          font-bold text-2xl border-none resize-none bg-[rgba(0,0,0,0)]
            focus:border-gray-500 focus:ring-0`}
            />
          </div>
          <div
            id="editor_toolBox"
            className="relative px-4  dark:bg-zinc-900 min-h-[50px]"
          >
            <div
              className="[&>button]:select-none [&>span]:select-none text-
              [&>button]:h-8 [&>button]:w-8 [&>button]:mx-[0.5px] [&>span]:mx-2 
            flex items-center justify-start border-y-[2px] h-full dark:border-gray-500 font-semibold "
            >
              <CDropDown
                useTag={false}
                callback={(result) => {
                  if (result == toolState.size) {
                    return;
                  }
                  onStyleEvent(
                    {
                      ...toolState,
                      size: result,
                    },
                    "size",
                    result
                  );
                }}
                showValue={toolState.size}
                buttnStyle={{ height: 32, width: 80 }}
                menuStyle={{ height: "auto", width: 90, left: -5, top: 35 }}
                items={sizeData}
              />

              {/* <button className="relative  text-base hover:dark:bg-slate-800">
                H2
              </button>
              <button className="relative text-base hover:dark:bg-slate-800">
                H3
              </button> */}
              <span className="relative  h-2/4 border-[1px] dark:border-gray-500" />
              <button
                id="editor_bold"
                onClick={(e) => {
                  onStyleEvent(
                    {
                      ...toolState,
                      bold: toolState.bold ? false : true,
                    },
                    "bold",
                    toolState.bold ? false : true
                  );
                  e.preventDefault();
                }}
                className={`relative  text-center ${
                  toolState.bold
                    ? "dark:bg-slate-800 ring-1 ring-gray-200"
                    : "hover:dark:bg-slate-800"
                }`}
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
                id="editor_italic"
                onClick={(e) => {
                  onStyleEvent(
                    {
                      ...toolState,
                      italic: toolState.italic ? false : true,
                    },
                    "italic",
                    toolState.italic ? false : true
                  );
                  e.preventDefault();
                }}
                className={`relative  text-center ${
                  toolState.italic
                    ? "dark:bg-slate-800 ring-1 ring-gray-200"
                    : "hover:dark:bg-slate-800"
                }`}
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
                id="editor_underline"
                onClick={(e) => {
                  onStyleEvent(
                    {
                      ...toolState,
                      underline: toolState.underline ? false : true,
                    },
                    "underline",
                    toolState.underline ? false : true
                  );
                  e.preventDefault();
                }}
                className={`relative  text-center ${
                  toolState.underline
                    ? "dark:bg-slate-800 ring-1 ring-gray-200"
                    : "hover:dark:bg-slate-800"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                  strokeWidth={0}
                  stroke="currentColor"
                  className="w-8 m-auto h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M 8 4 L 8 16 C 8 20.429915 11.570085 24 16 24 C 20.429915 24 24 20.429915 24 16 L 24 4 L 22 4 L 22 16 C 22 19.370085 19.370085 22 16 22 C 12.629915 22 10 19.370085 10 16 L 10 4 L 8 4 z M 6 26 L 6 28 L 26 28 L 26 26 L 6 26 z"
                  />
                </svg>
              </button>
              <span className="relative  h-2/4 border-[1px] dark:border-gray-500" />
              <CDropDown
                useTag={true}
                callback={(result) => {
                  if (result == toolState.align) {
                    return;
                  }
                  onStyleEvent(
                    {
                      ...toolState,
                      align: result,
                    },
                    "align",
                    result
                  );
                }}
                showValue={toolState.align}
                buttnStyle={{ height: 32, width: 50 }}
                menuStyle={{ height: "auto", width: 60, left: -5, top: 35 }}
                items={alignData}
              />
              <span className="relative  h-2/4 border-[1px] dark:border-gray-500" />
            </div>
          </div>
          <div
            id="editor_container"
            className="overflow-hidden relative h-[calc(100%-60px)] p-4 w-full"
          >
            <div
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.id != "editor_scroll") {
                  return;
                }
                //포커스 이벤트, 스크롤영역이 텍스트영역보다 크면 커서를 텍스트영역 맨아래로 옮긴다
                let scroll = document.getElementById("editor_scroll");
                let textArea = document.getElementById("editor_TextArea");

                if (scroll?.clientHeight! > textArea?.clientHeight!) {
                  let lastP = textArea?.lastChild as HTMLElement;
                  textArea?.focus();
                  if (lastP) {
                    //selection?.selectAllChildren(lastP?.lastChild!);
                    let last = lastP?.lastChild!;
                    if (last.nodeName != "BR" && last?.nodeType == type.NODE) {
                      last = last.lastChild!;
                    }

                    selection?.setBaseAndExtent(
                      last,
                      last?.nodeValue?.length!,
                      last,
                      last?.nodeValue?.length!
                    );
                  }
                  mouseUpEvt();
                }
              }}
              id="editor_scroll"
              className="overflow-auto h-[calc(100%)] relative   focus:outline-none w-full
            bg-[rgba(0,0,0,0)] dark:bg-zinc-900 cursor-text"
            >
              <div
                tabIndex={1}
                spellCheck="false"
                id="editor_TextArea"
                onChange={() => {}}
                //onBeforeInput={firstInputEvent}
                onInput={() => {
                  if (
                    selection?.focusNode?.nodeName == "P" ||
                    !selection!.focusNode!.nodeValue
                  ) {
                    return;
                  }
                  //값이 들어오고 난뒤 공백문자열이 있다면 날려줌
                  if (selection!.focusNode!.nodeValue?.indexOf("\u200B") > -1) {
                    let startIdx =
                      selection!.focusNode!.nodeValue!.indexOf("\u200B");
                    selection?.setBaseAndExtent(
                      selection?.focusNode!,
                      0,
                      selection?.focusNode!,
                      1
                    );
                    selection?.getRangeAt(0).deleteContents();
                    selection?.setBaseAndExtent(
                      selection?.focusNode!,
                      1,
                      selection?.focusNode!,
                      1
                    );
                  }
                }}
                onKeyDown={onTextAreaKeyDown}
                onKeyUp={onTextAreaKeyUp}
                ref={bodyArea}
                placeholder="내용을 입력해주세요.."
                contentEditable="true"
                className="relative break-all focus:outline-none  w-full  h-auto
            bg-[rgba(0,0,0,0)] dark:bg-zinc-900 text-xl "
              ></div>
            </div>
          </div>
        </div>
        <div
          id="editor_footer"
          className="h-[60px] relative flex items-center w-full  border-t-[1px] border-gray-400 dark:bg-zinc-700 bg-gray-200"
        >
          <button className="select-none absolute items-center inline-block p-2 text-lg font-semibold rounded-lg right-2 bg-emerald-500 hover:bg-emerald-700">
            Write Post
          </button>
          <button
            onClick={() => {
              router.back();
            }}
            className="select-none absolute items-center inline-block p-2 text-lg font-semibold rounded-lg left-2 bg-slate-600 hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default write;
