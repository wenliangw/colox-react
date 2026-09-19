import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * The docs sidebar mirrors the packaging mental model of the library:
 * groups are always visible (collapsed: false) like a component
 * library's category navigation — General (bare controls),
 * Form (field controls), Layout (page skeleton).
 */
const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'General',
      collapsed: false,
      items: [
        { type: 'doc', id: 'components/button', label: 'Button' },
        { type: 'doc', id: 'components/icon-button', label: 'IconButton' },
      ],
    },
    {
      type: 'category',
      label: 'Form',
      collapsed: false,
      items: [
        { type: 'doc', id: 'components/input', label: 'Input' },
        { type: 'doc', id: 'components/input-number', label: 'InputNumber' },
        { type: 'doc', id: 'components/date-picker', label: 'DatePicker' },
        { type: 'doc', id: 'components/textarea', label: 'Textarea' },
        { type: 'doc', id: 'components/select', label: 'Select' },
        { type: 'doc', id: 'components/checkbox', label: 'Checkbox' },
        { type: 'doc', id: 'components/switch', label: 'Switch' },
        { type: 'doc', id: 'components/slider', label: 'Slider' },
        { type: 'doc', id: 'components/radio', label: 'Radio' },
      ],
    },
    {
      type: 'category',
      label: 'Layout',
      collapsed: false,
      items: [
        { type: 'doc', id: 'components/container', label: 'Container' },
        { type: 'doc', id: 'components/grid', label: 'Grid' },
        { type: 'doc', id: 'components/stack', label: 'Stack' },
      ],
    },
  ],
};

export default sidebars;
