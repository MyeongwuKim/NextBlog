interface NormalBtnProps {
  width: number | string;
  height: number | string;
  content: string;
  onClickEvt?: () => void;
  type?: "submit" | "reset" | "button" | undefined;
}

const NormalBtn = ({
  content,
  onClickEvt,
  height,
  width,
  type,
}: NormalBtnProps) => {
  return (
    <button
      type={type}
      onClick={onClickEvt}
      style={{ width, height }}
      className=" 
      select-none inline-block dark:text-gray-200 
      text-lg border-2 border-gray-200 bg-white
      hover:border-gray-400 hover:dark:border-zinc-500
      dark:border-zinc-700 dark:bg-zinc-900 "
    >
      {content}
    </button>
  );
};

export default NormalBtn;
