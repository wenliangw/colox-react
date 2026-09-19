# Components

Component map with status. Full reference per shipped component lives in the
topic bundle's `references/component.md`.

| Component    | Responsibility                                                                                                                      | Status  | Doctrine     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------ |
| Stack        | flexbox layout: rows, columns, toolbars, spacers, responsive gaps                                                                   | shipped | skills/stack |
| Button       | actions (variants + interactive states)                                                                                             | shipped | pending      |
| Input        | single-line text entry with focus ring and field states                                                                             | shipped | pending      |
| InputNumber  | single-line number editor (decimal text input, chevron stepper, step precision, span clamp)                                         | shipped | pending      |
| DatePicker   | single-line date editor (canonical ISO value, valueFormat tokens, Monday-first month panel, min/max bounds)                         | shipped | pending      |
| Textarea     | multi-line text entry: shell contract, content-driven height (autosize + drag handle), footer bar (count / clear), themed scrollbar | shipped | pending      |
| Checkbox     | single boolean choice (label-wrapped, invalid/disabled states)                                                                      | shipped | pending      |
| Switch       | single boolean toggle (role="switch" input + palette track), invalid/disabled states                                                | shipped | pending      |
| Slider       | single-thumb numeric range (native range input, palette stripe, tick marks)                                                         | shipped | pending      |
| Radio        | single selection among named options via Radio.Group                                                                                | shipped | pending      |
| Select       | single/multi selection: popup panel, filtering, fold chips, tags                                                                    | shipped | pending      |
| AutoComplete | free-text combobox: injected host (Input family), Target/Suggestions/Option members, local filter + ARIA editable-combobox keyboard | shipped | pending      |
| IconButton   | square icon-only button primitive (shared reset + token-pinned size)                                                                | shipped | pending      |
| Grid         | grid layout mechanism                                                                                                               | shipped | skills/grid  |
| Positioner   | absolute positioning context                                                                                                        | planned | —            |
| Container    | semantic width shell (design-token widths, centered)                                                                                | shipped | pending      |
