interface OkBtnProps {
  isEnable?: boolean;
  width: number;
  height: number;
  content: string;
  onClickEvt?: () => void;
}

const OkBtn = ({
  isEnable,
  content,
  onClickEvt,
  height,
  width,
}: OkBtnProps) => {
  return (
    <button
      onClick={onClickEvt}
      disabled={typeof isEnable === "undefined" ? false : !isEnable}
      style={{ width, height }}
      className="disabled:bg-emerald-900
  relative items-center inline-block p-2 text-lg font-semibold rounded-md
   bg-emerald-500 hover:bg-emerald-700"
    >
      {content}
    </button>
  );
};

export default OkBtn;
