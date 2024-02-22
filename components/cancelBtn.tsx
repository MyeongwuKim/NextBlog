interface CancelBtnProps {
  content: string;
  onClickEvt?: () => void;
  width: number | string;
  height: number | string;
}

const CancelBtn = ({ content, onClickEvt, width, height }: CancelBtnProps) => {
  return (
    <button
      type="button"
      style={{ width, height }}
      onClick={onClickEvt}
      className={`text-white select-none relative items-center 
    inline-block text-lg sm:text-base font-semibold rounded-md
    bg-slate-600 hover:bg-slate-700`}
    >
      {content}
    </button>
  );
};

export default CancelBtn;
