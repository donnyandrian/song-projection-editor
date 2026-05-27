/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateId } from "@/lib/utils";
import { addSchema, BaseComponentSchema, type BaseComponent } from "@/schemas/converter";
import type * as CT from "@/types/converter";
import { isValidElement } from "react";
import type { ZodType } from "zod";

const spanConverter = ({ key, props: { children, ...props } = {} }: CT.SpanComponent) => {
    const processedChildren: React.ReactNode[] = [];

    if (children) {
        if (!Array.isArray(children)) {
            children = [children];
        }

        for (const child of children) {
            if (typeof child !== "string") {
                if (typeof child.key === "string") child.key = child.key.trim() || undefined;
                child.key ??= generateId();
            }
            const converted = converter(child);
            processedChildren.push(converted);
        }
    }

    return (
        <span key={key} {...props}>
            {processedChildren}
        </span>
    );
};

const brConverter = ({ key, props = {} }: CT.BrComponent) => {
    return <br key={key} {...props} />;
};

const converterMap: CT.ConverterMap = {
    $null: () => null,
    span: spanConverter,
    br: brConverter,
    $string: (content: string) => content,
};

export const converter = (content: CT.AllowedComponents) => {
    let key = typeof content === "string" ? "$string" : content.type;
    if (!converterMap[key]) key = "$null";

    return (converterMap[key] as (arg: CT.AllowedComponents) => CT.ConverterReturn)(content);
};

export const addConverter = <T extends string, S extends ZodType>(
    type: T,
    schema: S,
    converter: (content: BaseComponent<T, S>) => CT.ConverterReturn,
) => {
    console.log("Register Converter: ", type);
    addSchema(BaseComponentSchema(type, schema));
    converterMap[type] = converter as any;
};

export function convertReactToJson(node: React.ReactNode): any {
    // Base cases: React ignores booleans, null, and undefined
    if (typeof node === "boolean" || node === null || node === undefined) {
        return null;
    }

    // Base cases: Clean up strings and numbers
    if (typeof node === "string" || typeof node === "number") {
        if (typeof node === "string") {
            const trimmed = node.trim();
            // Ignore empty strings/whitespace often left behind by JSX formatting
            return trimmed === "" ? null : trimmed;
        }
        return node;
    }

    // Handle arrays (e.g., lists of children)
    if (Array.isArray(node)) {
        const processedArray = node
            .map((item) => (isValidElement(item) ? convertReactToJson(item) : item))
            .filter(
                (item) =>
                    item !== null && item !== undefined && typeof item !== "boolean" && item !== "",
            );

        if (processedArray.length === 0) return null;
        if (processedArray.length === 1) return processedArray[0];
        return processedArray;
    }

    // Handle valid React Elements (<span />, <MyComponent />)
    if (isValidElement(node)) {
        let typeName = "Unknown";

        // Extract the component's name
        if (typeof node.type === "string") {
            typeName = node.type; // Native HTML elements (e.g., "span", "div")
        } else if (typeof node.type === "function") {
            typeName = node.type.name || "AnonymousComponent"; // Custom components
        } else if (typeof node.type === "symbol") {
            typeName = (node.type as any).description || "Fragment"; // React.Fragment
        } else if (typeof node.type === "object" && node.type !== null) {
            // Higher-Order Components: React.memo, React.forwardRef
            const nodeType = node.type as any;
            // Check for React.memo()
            if (nodeType.type && typeof nodeType.type === "function") {
                typeName = nodeType.type.name || "MemoComponent";
            }
            // Check for React.forwardRef()
            else if (nodeType.render && typeof nodeType.render === "function") {
                typeName = nodeType.render.name || "ForwardRefComponent";
            }
            // Optional: Context Providers/Consumers
            else if (nodeType.$$typeof) {
                typeName = nodeType.$$typeof.description || "SpecialReactComponent";
            }
        }

        const jsonNode: Omit<BaseComponent<any, any>, "props"> & {
            props?: Record<string, unknown>;
        } = { type: typeName };

        // Attach key if it exists
        if (node.key != null) {
            jsonNode.key = node.key as string | number;
        }

        // Convert props
        if (node.props) {
            const propsObj: Record<string, unknown> = {};

            for (const [propKey, propValue] of Object.entries(node.props)) {
                // The prop is a React Element (e.g., icon={<Icon />}, or children: <span/>)
                if (isValidElement(propValue)) {
                    propsObj[propKey] = convertReactToJson(propValue);
                }

                // The prop is an array (e.g., children: [<div/>, <span/>] OR data: [{id: 1}])
                else if (Array.isArray(propValue)) {
                    // Map over the array: convert elements, leave plain data alone
                    const processedArray = propValue.map((item) =>
                        isValidElement(item) ? convertReactToJson(item) : item,
                    );

                    // If this array is specifically the 'children' prop, apply React's cleanup rules
                    if (propKey === "children") {
                        const cleanedArray = processedArray.filter(
                            (item) =>
                                item !== null &&
                                item !== undefined &&
                                typeof item !== "boolean" &&
                                item !== "",
                        );
                        if (cleanedArray.length > 0) {
                            propsObj[propKey] =
                                cleanedArray.length === 1 ? cleanedArray[0] : cleanedArray;
                        }
                    } else {
                        // Standard array props (like options=[...]) are kept intact
                        propsObj[propKey] = processedArray;
                    }
                }

                // String children (apply whitespace trim)
                else if (propKey === "children" && typeof propValue === "string") {
                    const trimmed = propValue.trim();
                    if (trimmed !== "") propsObj[propKey] = trimmed;
                }

                // Standard primitives, objects, and functions are passed through as-is
                else {
                    propsObj[propKey] = propValue;
                }
            }

            if (Object.keys(propsObj).length > 0) {
                jsonNode.props = propsObj;
            }
        }

        return jsonNode;
    }

    return null; // Fallback for unsupported types
}
