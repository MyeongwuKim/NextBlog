const Loading = ({ enable }) => {
  return (
    <div
      className={`${
        enable ? "block" : "hidden"
      } z-[99] bg-[rgba(255,255,255,0.15)] w-full h-full flex justify-center items-center absolute  left-0 top-0`}
    >
      <div className="loadingio-spinner-spinner-q4iokninqxs">
        <div className="ldio-fa83pt8hugh">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
