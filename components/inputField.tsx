import { HTMLInputTypeAttribute, ReactNode } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputFieldProps {
  id?: string;
  register: UseFormRegisterReturn;
  content: string;
  type?: HTMLInputTypeAttribute | undefined;
  fieldtype?: "input" | "textarea";
  icon?: ReactNode;
}

const styleClass = `relative 
focus:ring-emerald-500 focus:outline-none
dark:border-zinc-700 blur:border-gray-200 p-2 bg-transparent ring-0
 dark:text-gray-200 dark:placeholder:text-gray-400 placeholder:text-gray-200 
 text-xl text-slate-800 resize-none sm:text-base`;

const InputField = ({
  register,
  id,
  type,
  fieldtype,
  content,
  icon,
}: InputFieldProps) => {
  return (
    <>
      {fieldtype == "textarea" ? (
        <div className="relative w-full h-full">
          <textarea
            {...register}
            className="border p-2 border-color focus:border-emerald-500 peer h-full w-full 
            text-xl text-slate-800 sm:text-base  dark:text-gray-200
            resize-none rounded-[7px]  border-blue-gray-200 
             bg-transparent px-3 py-2.5 font-sans  font-normal
             text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border
              placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 
              focus:border-2  focus:border-t-transparent focus:outline-0 
              disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
            placeholder=" "
          />
          <label
            className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full 
          select-none text-[11px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none
          before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 
          before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all 
          after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 
          after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all 
          peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 
          peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] 
          peer-focus:leading-tight peer-focus:before:border-t-2 peer-focus:before:border-l-2 
           peer-focus:after:border-t-2 peer-focus:after:border-r-2 
          peer-disabled:text-transparent peer-disabled:before:border-transparent 
          peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500
            peer-focus:text-emerald-500 before:border-color peer-focus:before:!border-emerald-500 after:!border-color
          peer-focus:after:!border-emerald-500 text-slate-800 dark:text-gray-200 blur:border-color
          "
          >
            {content}
          </label>
        </div>
      ) : (
        <div className="w-full h-full">
          <div className="relative">
            <input
              {...register}
              type={type}
              className="border p-2 border-color focus:border-emerald-500
            text-xl text-slate-800 resize-none sm:text-base  dark:text-gray-200
            peer w-full h-full bg-transparent text-blue-gray-700 font-sans font-normal outline outline-0 focus:outline-0 d
            isabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border 
            placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 
             focus:border-2  focus:border-t-transparent px-3 py-2.5 rounded-[7px]
            "
              placeholder=" "
            />
            <label
              className="flex w-full select-none pointer-events-none absolute left-0 font-normal 
          !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500
          leading-tight peer-focus:leading-tight peer-disabled:text-transparent
          peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all
          -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px]
          before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5
          before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent
          before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l
          peer-focus:before:border-l-2 before:pointer-events-none before:transition-all
          peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border
          after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md
          after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none a
          fter:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-blue-gray-400
          peer-focus:text-emerald-500 before:border-color peer-focus:before:!border-emerald-500 after:!border-color
          peer-focus:after:!border-emerald-500 text-slate-800 dark:text-gray-200 blur:border-color"
            >
              {content}
            </label>
          </div>
          {icon ? (
            <span className="absolute w-auto h-auto place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4 ">
              {icon}
            </span>
          ) : null}
        </div>
      )}
    </>
  );
};

export default InputField;

// import { HTMLInputTypeAttribute } from "react";
// import { UseFormRegisterReturn } from "react-hook-form";

// interface InputFieldProps {
//   id?: string;
//   placeholder?: string;
//   register: UseFormRegisterReturn;
//   width: string;
//   height: string;
//   type?: HTMLInputTypeAttribute | undefined;
//   fieldtype?: "input" | "textarea";
// }

// const styleClass = `relative focus:ring-emerald-500 focus:outline-none
// dark:border-zinc-700 blur:border-gray-200 p-2 bg-transparent ring-0
//  dark:text-gray-200 dark:placeholder:text-gray-400 placeholder:text-gray-200
//  text-xl text-slate-800 resize-none`;

// const InputField = ({
//   register,
//   id,
//   placeholder,
//   width,
//   height,
//   type,
//   fieldtype,
// }: InputFieldProps) => {
//   return (
//     <>
//       {fieldtype == "textarea" ? (
//         <textarea
//           id={id}
//           style={{ width, height, verticalAlign: "top" }}
//           {...register}
//           placeholder={placeholder}
//           className={`border-2 ring-2 ${styleClass}`}
//         />
//       ) : (
//         <input
//           id={id}
//           style={{ width, height, verticalAlign: "top" }}
//           {...register}
//           placeholder={placeholder}
//           type={type}
//           className={`border-b-[2px]
//           focus:dark:border-emerald-500
//           focus:border-emerald-500 ${styleClass}`}
//         />
//       )}
//     </>
//   );
// };
