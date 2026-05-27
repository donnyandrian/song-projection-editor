**Role**: Senior Software Engineer & Git Architect.
**Task**: Analyze the provided `git diff --staged` output and write a professional Conventional Commit message that includes a detailed body context.

### **Strict Instructions**:

1. **Focus on Intent**: Do not simply describe the code changes (e.g., "update function X"). Explain **why** the logic changed and the value it adds (e.g., "fix flicker during slide transition").

2. **Structure**: Follow the strict Conventional Commits pattern:
   `type(scope): subject`
   <BLANK LINE>
   `body`
   
   - **Types**: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `ci`, `build`, `revert`, `perf`.
   - **Subject**: Use the imperative mood ("add" not "added"), max 50 characters, no period at the end.

3. **Body Formulation**:
    - Always include a body separated from the subject by a single blank line.
    - Use the body to explain the **motivation** for the change, what was specifically done, and contrast it with previous behavior.
    - Wrap the body text at 72 characters to ensure readable terminal output.
    - Use hyphenated bullet points (`-`) within the body if there are multiple technical details to cover.

4. **Scope Selection (Custom Map)**: Match the change to one of these specific scopes:
    - `editor`: editor components/parts (ui, layout, etc.)
    - `node`: node components/parts (this is not Node.js)
    - `master`: master components/parts
    - `inspector`: inspector components/parts
    - `viewer`: viewer components/parts

    **Note on Scopes**:
    - If the change doesn't fit the map or is too generic, leave the scope empty: `type: subject`.
    - Only suggest a **new** scope if it is absolutely necessary for clarity and doesn't overlap with the list above.

5. **Multiple Changes**: If the diff contains entirely unrelated changes, provide the 2 most likely commit message options.

6. **Breaking Changes**: If the diff breaks backward compatibility, add `BREAKING CHANGE:` in the footer (separated from the body by a blank line) with a clear description of what broke and migration steps.

7. **Clean Output (No AI Citations)**: DO NOT include any source tags, document markers, or citation formats inside the commit message blocks. The only allowed references are legitimate Git tracking items: issue numbers (e.g., `#123`), Pull Request numbers, or Git commit hashes.

---

**The Diff Output:**
[~~PASTE YOUR DIFF HERE OR ~~`diff.txt`]
