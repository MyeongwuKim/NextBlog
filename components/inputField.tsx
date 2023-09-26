import { HTMLInputTypeAttribute } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface InputFieldProps {
  id?: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  width: string;
  height: string;
  type?: HTMLInputTypeAttribute | undefined;
  fieldtype?: "input" | "textarea";
}

const styleClass = `relative 
focus:ring-emerald-500 focus:outline-none
dark:border-zinc-700 blur:border-gray-200 p-2 bg-transparent ring-0
 dark:text-gray-200 dark:placeholder:text-gray-400 placeholder:text-gray-200 
 text-xl text-slate-800 resize-none`;

const InputField = ({
  register,
  id,
  placeholder,
  width,
  height,
  type,
  fieldtype,
}: InputFieldProps) => {
  return (
    <>
      {fieldtype == "textarea" ? (
        <textarea
          id={id}
          style={{ width, height, verticalAlign: "top" }}
          {...register}
          placeholder={placeholder}
          className={`border-2 rounded-md focus:ring-[2px] ${styleClass}`}
        />
      ) : (
        <input
          id={id}
          style={{ width, height, verticalAlign: "top" }}
          {...register}
          placeholder={placeholder}
          type={type}
          className={`${styleClass} border-b-[2px]
           focus:dark:border-emerald-500
           focus:border-emerald-500`}
        />
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
