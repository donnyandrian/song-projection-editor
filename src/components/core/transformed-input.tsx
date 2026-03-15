import { useState, type ChangeEvent, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";

interface TransformedInputProps extends Omit<ComponentProps<"input">, "onChange"> {
    transformer?: (value: string) => string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

function TransformedInput({
    transformer,
    onChange,
    onBlur,
    defaultValue,
    value,
    ...props
}: TransformedInputProps) {
    const initialValue = value ?? defaultValue ?? "";
    const [internalValue, setInternalValue] = useState(String(initialValue));
    const [prevValueProp, setPrevValueProp] = useState(value);

    if (value !== prevValueProp) {
        setPrevValueProp(value);

        const expectedTransformed = transformer ? transformer(internalValue) : internalValue;

        if (value !== expectedTransformed && value !== undefined && value !== null) {
            setInternalValue(String(value));
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setInternalValue(rawValue);

        if (onChange) {
            const transformedValue = transformer ? transformer(rawValue) : rawValue;

            const transformedEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: transformedValue,
                },
            } as React.ChangeEvent<HTMLInputElement>;

            onChange(transformedEvent);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (transformer) {
            const transformedValue = transformer(internalValue);
            setInternalValue(transformedValue);
        }

        onBlur?.(e);
    };

    return <Input {...props} value={internalValue} onChange={handleChange} onBlur={handleBlur} />;
}
TransformedInput.displayName = "TransformedInput";

export { TransformedInput };
