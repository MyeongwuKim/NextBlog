import { NextPage } from "next";

interface IPostDetail {
  category?: string;
  title?: string;
  date?: string;
  content?: string;
  tag?: string[];
}

const CPostDetail: NextPage<IPostDetail> = ({ title, date, content, tag }) => {
  return <div className="w-full h-auto mb-16"></div>;
};

export default CPostDetail;
