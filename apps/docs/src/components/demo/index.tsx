import type { ReactNode } from 'react';
import CodeBlock from '@theme/CodeBlock';
import { IconChevronDown } from '@colox/icons';

type DemoProps = {
  /** Block title, rendered above the preview. */
  title: string;
  /** One-line description of the example. */
  description?: string;
  /** Source shown in the expandable code panel. */
  code?: string;
  /** CodeBlock language for the panel. */
  language?: string;
  /** The rendered preview. */
  children: ReactNode;
};

/**
 * The docs demo block: a titled preview with an expandable code panel —
 * the example unit every component page composes its Examples section
 * from. The preview renders real components (the page teaches the
 * design language by following it), the code panel stays closed until
 * asked for (native `details`, accessible by construction).
 */
export default function Demo({ title, description, code, language = 'tsx', children }: DemoProps) {
  return (
    <div className="colox-demo">
      <div className="colox-demo-header">
        <h4 className="colox-demo-title">{title}</h4>
        {description ? <p className="colox-demo-desc">{description}</p> : null}
      </div>
      <div className="colox-demo-preview">{children}</div>
      {code ? (
        <details className="colox-demo-code">
          <summary className="colox-demo-code-toggle">
            <IconChevronDown className="colox-demo-code-caret" />
            <span>Code</span>
          </summary>
          <CodeBlock language={language}>{code}</CodeBlock>
        </details>
      ) : null}
    </div>
  );
}
