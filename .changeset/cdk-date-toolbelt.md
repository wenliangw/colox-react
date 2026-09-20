---
'@colox/react': minor
'@colox/wiki': minor
---

The cdk date core becomes a public toolbelt: `@colox/react/cdk/date`
ships the curated date/time helpers — `formatDate`, `parseDateText`,
`compare`, `addDays`, `addMonths`, `todayIso`, `toLocalDate`,
`fromLocalDate` plus the time family (`parseTimeText`, `formatTime`).
Values stay canonical ISO strings (`YYYY-MM-DD` / `YYYY-MM` / `YYYY` /
`HH:mm`); the panel grid builders remain internal. The date picker now
reads this core from cdk (same behavior, zero visual change), and the
time core (24-hour `HH:mm` parse/format, zero-timezone clock math)
lands alongside — the foundation the TimePicker builds on next.