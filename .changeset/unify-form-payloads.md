---
'@colox/react': minor
'@colox/wiki': minor
---

Unify the form-leaf change payload: every component-level `onChange` now
speaks the family shape `{ event, value }`. Input, Textarea, Checkbox,
Switch and Radio join Select / InputNumber / DatePicker / Slider /
Checkbox.Group / Radio.Group / AutoComplete, so a leaf no longer hands the
native event over untouched — `event` stays the original change event
(propagation control) and `value` carries the component's own next value
(boolean for the single Checkbox / Radio / Switch, text for Input and
Textarea), while the `value` prop keeps its form-token / member-key
meaning. AutoComplete's injected host contract follows the same payload,
which is what lets the Form layer read every control uniformly — one word
shape across the form family. Preview stories, docs pages and the wiki
modules updated in lockstep.
