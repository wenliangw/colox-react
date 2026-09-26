/**
 * Rolling-column geometry and motion constants — the TS mirror of the
 * literals in `styles/base.scss` (option height 28px, gap 2px): the
 * scroll maths ride the stride and the offsets, so these numbers must
 * stay in lock-step with the stylesheet.
 *
 * Everything a cyclic option wheel needs lives here. The time picker's
 * three columns consume the set today; any future wheel (a time
 * column under showTime, another cyclic picker) imports it from the
 * same place instead of re-declaring it.
 */

/** The visible option count per column viewport (8 slots). */
export const COLUMN_VISIBLE = 8;

/**
 * The arrow-button scroll step: a full viewport minus one — the
 * adjacent window keeps exactly one option in common, so a 60-option
 * column needs 9 clicks to walk a lap (8/9ths overlap per step).
 */
export const COLUMN_STEP = 7;

/** The fixed slot (0-based) the pending option rests at (3 above, 4 below). */
export const COLUMN_FOCUS_SLOT = 3;

/** Column geometry — option height 28px, gap 2px, stride 30px. */
export const COLUMN_OPTION_HEIGHT = 28;
export const COLUMN_OPTION_GAP = 2;
export const COLUMN_OPTION_STRIDE = COLUMN_OPTION_HEIGHT + COLUMN_OPTION_GAP;

/**
 * The rendered window: a flight margin around the focus slot's
 * 3-up/4-down window (10 lead + 12 trail = 22 options), positioned
 * inside a three-lap track by two spacer elements.
 */
export const RANGE_LEAD = COLUMN_STEP + COLUMN_FOCUS_SLOT;
export const RANGE_TRAIL = 1 + (COLUMN_VISIBLE - 1 - COLUMN_FOCUS_SLOT) + COLUMN_STEP;

/** The track repeats the option cycle on three laps so the wheel can roll through 23 → 00 seamlessly. */
export const LAP_COUNT = 3;

/** The focus slot's top offset inside the viewport (the re-align target). */
export const SLOT_OFFSET_PX = COLUMN_FOCUS_SLOT * COLUMN_OPTION_STRIDE;

/** The wheel maps one option per 50 px (a ~100 px notch = two options). */
export const WHEEL_ITEM_PX = 50;

/** A line-mode delta unit equals three options (browser scroll lines). */
export const WHEEL_LINE_ITEMS = 3;

/**
 * A scroll counts as running until it quiets for this long; the
 * listbox wears `--scrolling` and the cells' pointer events stay off,
 * so cells streaming under the cursor cannot flash their hover wash
 * mid-roll — the wash may only appear once the wheel really rests.
 */
export const SCROLLING_QUIET_MS = 100;

/** The re-align glide's duration — also the chevron step's throttle window. */
export const GLIDE_MS = 240;
