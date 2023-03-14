import { NextPage } from "next";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

//WYSIWYG에디터
//예전 방식 contentEditable,execCommand 활용 -> 이제 웹표준이아님
/* 

- 23.2.27 클립보드 작성
- 23.3.13 문단이벤트,복사붙여넣기이벤트,지우기이벤트 작성

*/
interface IMultiKey {
  ctrl: boolean;
  shift: boolean;
  back: boolean;
}

var clipBoardText: string;
var selection: Selection | null;
var newRange: Range;
var device: string;
var multiKey: IMultiKey = {
  ctrl: false,
  shift: false,
  back: false,
};
var blockKeys = ["Tab", "Arrow", "Esc"];

const write: NextPage = () => {
  const [style, setStyle] = useState<string>("''");
  const router = useRouter();
  const titleArea = useRef<any>();
  const bodyArea = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //클립보드 업데이트용, 차후 변경할수있음
    // window.addEventListener("focus", () => {
    //   clipBoardUpdate("focus");
    // });

    device = navigator?.userAgent.toLowerCase();
    selection = document.getSelection(); //현재 커서 정보
    newRange = document.createRange(); //새로 설정할 커서정보

    let count = 1;
    // for (let i = 0; i < count; i++) {
    //   const { current } = bodyArea;
    //   const pNode: HTMLElement = document.createElement("p");

    //   //b 태그 내부에 선택영역의 text 넣기

    //   pNode.innerHTML = "text<span>span1</span>text<span>span2</span>";
    //   current?.append(pNode);

    //   //selection?.getRangeAt(0)?.insertNode(pNode);

    //   newRange.setStartAfter(pNode);
    //   // newRange.setStart(pNode, 0);
    //   // newRange.setEnd(pNode, 0);
    //   newRange.collapse(true);

    //   selection?.removeAllRanges();
    //   //selection.setBaseAndExtent(spanNode, 0, spanNode, 0);
    //   selection?.addRange(newRange);
    // }
  });

  const clipBoardRead = () => {
    navigator.clipboard
      .readText()
      .then((result) => {
        //복붙할때 현재 위치한 커서에 넣어야함,check <p> tag
        let node = createParagraph(false) as HTMLElement;
        node.innerHTML = result;
      })
      .catch((err) => {
        console.error("wrong read", err);
      });
  };

  const onStyleEvent = () => {
    // const range = selection?.getRangeAt(0);
    // const strongElement = document.createElement("u");
    // range?.surroundContents(strongElement); //엘리먼트를 만들어서 입힌다
    //strongElement.setAttribute("style", "color:red");
    // console.log(range?.commonAncestorContainer);
    //console.log(range?.commonAncestorContainer.nodeName);

    // //선택 영역 찾기
    const selected = selection?.getRangeAt(0);

    //b 태그 생성
    const node: HTMLElement = document.createElement("u");
    const styleSpan: HTMLElement = document.createElement("span");
    //b 태그 내부에 선택영역의 text 넣기
    node.innerText = selected as any;
    styleSpan.innerHTML = node.outerHTML;

    selected?.deleteContents(); //선택영역삭제
    selected?.insertNode(styleSpan);
  };
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

  /*문단을 만든다
  -커서 앞에 글자가 있을경우
  1.맨 앞인경우 -> 문단을 새로만들고 현재 커서가 위치한 문단을 한칸 내린다
  2.커서가 문자사이에 있을경우 -> 커서뒤에있는 문자열은 두고, 앞에있는 문자열을 아래문단으로 옮김
  -커서가 문자 맨뒤에 있을경우
  1.그냥 문단을 만듬
  */
  const caretInStringEvent = (): string | void => {
    let anchor = selection?.focusNode;
    let anchorOffset = selection?.focusOffset;
    let focus = anchor?.nextSibling as Node;

    if (!focus) {
      let nextSibling = anchor?.parentNode as Node;
      while (true) {
        if (nextSibling.nodeName == "P" || nextSibling.nodeName == "DIV") break;

        let swapAchor = nextSibling;
        if (swapAchor?.parentNode?.nodeName == "P") break;
        else {
          nextSibling = swapAchor.parentNode as Node;
        }
      }
      focus = nextSibling;
    }

    if (focus) {
      while (true) {
        let nextNode = focus.nextSibling;
        if (!nextNode) break;
        else focus = nextNode;
      }
      selection!.setBaseAndExtent(anchor!, anchorOffset!, focus, 1);

      let docNode = selection?.getRangeAt(0).extractContents();
      let commonNode = selection?.getRangeAt(0).commonAncestorContainer;

      commonNode?.childNodes.forEach((node: any) => {
        //type 1 is Element, Text is 3
        if (node.nodeType == 1) {
          if (node.innerHTML.length <= 0) commonNode?.removeChild(node);
        }
      });
      let newNode = "";
      docNode?.childNodes.forEach((node: any) => {
        if (node.nodeType == 1) {
          if (node.innerHTML.length > 0) {
            newNode += node.outerHTML;
          }
        } else if (node.nodeType == 3) {
          newNode += node.nodeValue;
        }
      });
      return newNode;
    }
  };
  //p노드안에있는 문자열 길이, 커서 오프셋 리턴
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
        if (node.nodeType == 3) caretOffset += node?.nodeValue!.length;
        else if (node.nodeType == 1) {
          caretOffset += node?.innerText!.length;
        }
      });

    //selection?.setBaseAndExtent(focusNode, focusOffset, focusNode, focusOffset);
    selection?.removeAllRanges();
    selection?.addRange(ragne!);
    //br은 1로 취급
    return [pNode.innerText.length, caretOffset];
  };

  const removeEvent = (e: React.KeyboardEvent) => {
    let [pNodeLength, caretOffset] = paragraphInfo();
    const { current } = bodyArea;
    let bodypNodeLength = current?.getElementsByTagName("p").length;
    let currentNode = selection?.focusNode as HTMLElement;

    if (currentNode.nodeName == "DIV") return;
    if (caretOffset >= 1 && caretOffset <= pNodeLength) return;

    while (true) {
      if (currentNode?.nodeName == "P") break;
      else {
        currentNode = currentNode.parentNode as HTMLElement;
      }
    }
    //커서가 맨끝에 위치해 있다면
    if (caretOffset <= 0) {
      let prevNode = currentNode.previousSibling as HTMLElement;
      if (!prevNode) return; //위에 다른 노드가 없으면 리턴
      if (prevNode.innerHTML.replace("<br>", "").length <= 0) {
        //위에 다른 노드가 있고 값이 아무것도 없다면, 위의 노드를 삭제(위로당긴다)
        current?.removeChild(prevNode);
        e.preventDefault();
        return;
      } else {
        //위에 다른 노드가 있고 값이 있다면, 위의 노드랑 합침
        let offset: number = prevNode.lastChild?.nodeValue?.length!;
        let offsetNode = prevNode.lastChild;

        if (prevNode.lastChild?.nodeType == 1) {
          let node = prevNode.lastChild as HTMLElement;
          offsetNode = node.lastChild;
          offset = offsetNode?.nodeValue?.length!;
        }

        selection?.setBaseAndExtent(offsetNode!, offset, offsetNode!, offset);

        while (currentNode.childNodes.length > 0) {
          let child = currentNode.firstChild;
          let childoffset = child?.nodeValue?.length;

          if (child?.nodeType == 1) {
            childoffset = child.lastChild?.nodeValue?.length;
          }

          selection?.getRangeAt(0).insertNode(child!);
          selection?.getRangeAt(0)?.selectNodeContents(child!);
          selection?.getRangeAt(0).collapse(false);
        }
        selection?.setBaseAndExtent(offsetNode!, offset, offsetNode!, offset);
        selection?.getRangeAt(0).collapse(true);
        e.preventDefault();
      }
    }
  };

  const createParagraph = (isFirstInput: boolean): Node | void => {
    const { current } = bodyArea;
    const pLength = current?.getElementsByTagName("p").length;
    const pNode: HTMLElement = document.createElement("p");

    let [pNodeLength, caretOffset] = paragraphInfo();
    let insertEvent: InsertPosition = "afterbegin"; //beforebegin:앞에, afterend:뒤에
    let cursorStay = false;
    let currentNode = selection?.focusNode as HTMLElement;

    pNode.innerHTML = "<br>";

    if (currentNode.nodeName != "DIV") {
      while (true) {
        if (currentNode?.nodeName == "P") break;
        else {
          currentNode = currentNode.parentNode as HTMLElement;
        }
      }
    }
    //가리키는 커서에 값이 있다면..
    if (selection?.focusNode?.nodeValue) {
      //커서가 드래그 되어있다 -> 삭제하고 커서아래에 노드생성후 생성한 노드를 가리킴
      if (selection.type == "Range") {
        selection.getRangeAt(0).deleteContents();
        insertEvent = "afterend";
      }
      //드래그가 되어있지 않다
      else if (selection.type == "Caret") {
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
    if (pLength! <= 0) {
      current?.append(pNode);
    } else currentNode.insertAdjacentElement(insertEvent, pNode);

    //커서가 stay여야만 할때, 커서 이동X
    if (!cursorStay) {
      newRange.selectNode(pNode);
      selection?.collapseToStart();
      selection?.setBaseAndExtent(
        pNode.childNodes[0],
        0,
        pNode.childNodes[0],
        0
      );
    }

    // current?.append(pNode);
    // newRange.setStartAfter(pNode);
    // newRange.collapse(true);
    // //make the cursor there
    // selection?.removeAllRanges();
    // //selection?.setBaseAndExtent(pNode.children[0], 1, pNode.children[0], 1);
    // selection?.addRange(newRange);
    // if (isCaretFront) {
    //   newRange.selectNode(pNode);
    //   selection?.collapseToStart();
    //   selection?.setBaseAndExtent(
    //     pNode.childNodes[0],
    //     0,
    //     pNode.childNodes[0],
    //     0
    //   );
    // } else {
    //   selection?.collapseToStart();
    //   selection?.setBaseAndExtent(pNode, 0, pNode, 0);
    // }

    if (isFirstInput) createParagraph(false);

    scrollEvent();

    return pNode;
  };

  //커서가 화면 보이는내에서 끝으로 이동함,커서가 스크롤 밖으로 안나가게하는듯
  //스크롤 맨 아래에서 해당커서 아래 노드 길이만큼 이랑 마진 y만큼뺀다(16px)4
  const scrollEvent = () => {
    let editScroll = document.getElementById("editor_body_scroll");
    let editHeight = editScroll?.clientHeight!;
    let scrollHeight = editScroll?.scrollHeight!;
    let bottomOffset = scrollHeight - editHeight;

    console.log(bottomOffset);
    editScroll?.scrollTo(0, bottomOffset);
  };

  //텍스트가 바디에 들어가기전에 작동함
  const onBodyKeyDown = (e: React.KeyboardEvent) => {
    const { current } = bodyArea;
    const pLength = current?.getElementsByTagName("p").length;
    if (multiKey.ctrl) {
      if (e.key == "c") {
      }
      if (e.key == "v") {
        clipBoardRead();
        e.preventDefault();
      }
      if (e.key == "Shift") {
        console.log(selection!.getRangeAt(0));
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
            if (key == e.key) {
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
        }
      }
    }
  };

  const onBodyKeyUp = (e: React.KeyboardEvent) => {
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
          <div className="relative h-auto max-h-[50%]">
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
            id="editor"
            className=" relative px-4  dark:bg-zinc-900 min-h-[50px]"
          >
            <div className="flex items-center justify-start border-y-[2px] h-full dark:border-gray-500 font-semibold ">
              <button
                onClick={() => {
                  setStyle("'font-size: 2.25rem; font-weight:700;'");
                }}
                className="relative w-10 h-full text-base hover:dark:bg-slate-800"
              >
                H1
              </button>
              <button
                onClick={() => {
                  document.execCommand("bold", false);
                }}
                className="relative w-10 h-full text-base hover:dark:bg-slate-800"
              >
                H2
              </button>
              <button className="relative w-10 h-full text-base hover:dark:bg-slate-800">
                H3
              </button>
              <span className="relative  h-2/4 border-[1px] dark:border-gray-500" />
              <button className="relative w-10 h-full text-center hover:dark:bg-slate-800">
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
            </div>
          </div>
          <div
            onClick={() => {}}
            id="editor_body_scroll"
            className="overflow-auto relative h-full  focus:outline-none p-4 w-full
            bg-[rgba(0,0,0,0)] dark:bg-zinc-900 cursor-text"
          >
            <div
              tabIndex={1}
              spellCheck="false"
              id="editor_body"
              //onBeforeInput={firstInputEvent}
              onKeyDown={onBodyKeyDown}
              onKeyUp={onBodyKeyUp}
              ref={bodyArea}
              placeholder="내용을 입력해주세요.."
              contentEditable="true"
              className="relative break-all focus:outline-none  w-full  h-auto
            bg-[rgba(0,0,0,0)] dark:bg-zinc-900 text-xl "
            ></div>
          </div>
        </div>
        <div className="h-[60px] relative flex items-center w-full  border-t-[1px] border-gray-400 dark:bg-zinc-700 bg-gray-200">
          <button className="absolute items-center inline-block p-2 text-lg font-semibold rounded-lg right-2 bg-emerald-500 hover:bg-emerald-700">
            Write Post
          </button>
          <button
            onClick={() => {
              router.back();
            }}
            className="absolute items-center inline-block p-2 text-lg font-semibold rounded-lg left-2 bg-slate-600 hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default write;
