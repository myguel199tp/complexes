import React from "react";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  onClick?: () => void;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, placeholder }, ref) => (
    // Sigue siendo <input> nativo: react-datepicker necesita el ref y
    // InputField está tipado como FC<FieldProps>, que no lo expone.
    <input
      ref={ref}
      value={value || ""}
      onClick={onClick}
      readOnly
      placeholder={placeholder}
      onPaste={(e) => e.preventDefault()}
      className="ui-native cursor-pointer w-full"
    />
  )
);

CustomInput.displayName = "CustomInput";

export default CustomInput;
