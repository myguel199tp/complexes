import React from "react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onClick?: () => void;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, placeholder }, ref) => (
    <input
      ref={ref}
      value={value || ""}
      onClick={onClick}
      readOnly
      placeholder={placeholder}
      onPaste={(e) => e.preventDefault()}
      className="bg-gray-200 p-3 rounded-md cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  )
);

CustomInput.displayName = "CustomInput";

export default CustomInput;
