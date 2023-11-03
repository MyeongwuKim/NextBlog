import { useEffect, useState } from "react";

const DotLoading = ({
  dotAmount,
  width,
  height,
}: {
  dotAmount: number;
  width: number | string;
  height: number | string;
}) => {
  const [dot, setDotState] = useState<number[]>([]);
  useEffect(() => {
    let dotArr = [];
    for (let i = 0; i < dotAmount; i++) {
      dotArr.push(i);
    }
    setDotState(dotArr);
  }, [dotAmount]);
  return (
    <>
      <div className="flex  space-x-2 justify-start items-center [&>div]:dark:bg-gray-400 [&>div]:bg-slate-400 opacity-20">
        {dot.map((v, i) => (
          <DotItem width={width} height={height} key={i} />
        ))}
      </div>
    </>
  );
};

export const DotItem = ({
  height,
  width,
}: {
  width: number | string;
  height: number | string;
}) => {
  return (
    <div
      style={{ width, height }}
      className="rounded-sm animate-pulse [animation-delay:-0.01s]"
    />
  );
};

export default DotLoading;
