# Components

Component map with status. Full reference per shipped component lives in the
topic bundle's `references/component.md`. `planned` rows carry their roadmap
milestone (see `ROADMAP.md`, the single source of truth for ordering and for the
"on demand" candidates that are not committed yet); the Doctrine column reads `—`
until a component ships and gets its bundle.

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
| Anchor       | reference frame: relative positioning context (+ hug), the reference for absolute children                                          | shipped | pending      |
| Positioner   | positioning mechanism: Anchor reference frame + Positioner pinned box (placement + token offset), nestable                          | shipped | pending      |
| Container    | semantic width shell (design-token widths, centered)                                                                                | shipped | pending      |
| Form         | form provider: field state, rules, submit lifecycle (+ Field / Label / Hint / Validate, useForm)                                    | shipped | pending      |
| FieldArray   | repeating field groups                                                                                                              | planned | M3           |
| InputGroup   | grouped input with addons and segments (namespace reserved)                                                                         | planned | M3           |
| TimePicker   | single-line time editor (DatePicker sibling)                                                                                        | planned | M3           |
| Tooltip      | hover/focus hint layer                                                                                                              | planned | M4           |
| Popover      | interactive floating content                                                                                                        | planned | M4           |
| Modal        | modal dialog with focus management                                                                                                  | planned | M4           |
| Drawer       | edge-anchored sliding panel                                                                                                         | planned | M4           |
| Toast        | transient notification stack                                                                                                        | planned | M4           |
| Avatar       | user/entity image with fallback                                                                                                     | planned | M5           |
| Badge        | count/status marker                                                                                                                 | planned | M5           |
| Tag          | removable label chip                                                                                                                | planned | M5           |
| Alert        | inline status message                                                                                                               | planned | M5           |
| Progress     | determinate/indeterminate progress                                                                                                  | planned | M5           |
| Skeleton     | loading placeholder                                                                                                                 | planned | M5           |
| Empty        | empty-state placeholder                                                                                                             | planned | M5           |
| Tabs         | tabbed views                                                                                                                        | planned | M6           |
| Accordion    | collapsible sections                                                                                                                | planned | M6           |
| Card         | content container                                                                                                                   | planned | M6           |
| Breadcrumb   | hierarchical trail                                                                                                                  | planned | M6           |
| Pagination   | page navigation                                                                                                                     | planned | M6           |
| Menu         | dropdown menu                                                                                                                       | planned | M6           |
| Steps        | step indicator                                                                                                                      | planned | M6           |
| Table        | data table                                                                                                                          | planned | M7           |
| VirtualList  | windowed rendering                                                                                                                  | planned | M7           |
| Tree         | hierarchical data                                                                                                                   | planned | M7           |
| ScrollView   | scroll container (with sticky)                                                                                                      | planned | M8           |
| Affix        | pin to a scroll boundary                                                                                                            | planned | M8           |
| Splitter     | resizable panes                                                                                                                     | planned | M8           |
| Mentions     | mention-enabled text area (cdk/combobox consumer)                                                                                   | planned | M9           |
| Cascader     | hierarchical select (cdk/combobox consumer)                                                                                         | planned | M9           |
| TreeSelect   | tree-shaped select (cdk/combobox consumer)                                                                                          | planned | M9           |
| Transfer     | dual-list transfer (cdk/combobox consumer)                                                                                          | planned | M9           |
