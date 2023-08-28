interface OkBtnProps {
  isEnable?: boolean;
  width: number | string;
  height: number | string;
  content: string;
  onClickEvt?: () => void;
  type?: "submit" | "reset" | "button" | undefined;
}

const OkBtn = ({
  isEnable,
  content,
  onClickEvt,
  height,
  width,
  type,
}: OkBtnProps) => {
  return (
    <button
      type={type}
      onClick={onClickEvt}
      disabled={typeof isEnable === "undefined" ? false : !isEnable}
      style={{ width, height }}
      className="disabled:bg-emerald-900 text-white
  relative items-center inline-block p-2 text-lg font-semibold rounded-md
   bg-emerald-500 hover:bg-emerald-700"
    >
      {content}
    </button>
  );
};

export default OkBtn;
