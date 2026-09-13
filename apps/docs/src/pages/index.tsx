import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import {
  Button,
  Checkbox,
  Container,
  Grid,
  IconButton,
  Input,
  Radio,
  Select,
  Stack,
} from '@colox/react';
import { ColoxTheme } from '@colox/theme';
import { IconCheck, IconChevronRight, IconPlus, IconSearch } from '@colox/icons';
import '@colox/react/style.css';
import styles from './index.module.css';

const PALETTES = ['primary', 'gray', 'info', 'error', 'warning', 'success'] as const;
const BUTTON_VARIANTS = ['solid', 'subtle', 'surface', 'outline', 'ghost'] as const;
const ICON_VARIANTS = ['plain', 'muted', 'ghost', 'outline', 'surface', 'subtle', 'solid'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg'] as const;

const AXES: {
  eyebrow: string;
  title: string;
  summary: string;
  demo: ReactNode;
}[] = [
  {
    eyebrow: 'palette — what it means',
    title: 'Six semantic families',
    summary:
      'Colors answer meaning, never mood. Components default to gray — an accent is always opt-in.',
    demo: (
      <Stack direction="row" gap="2" wrap>
        {PALETTES.map((palette) => (
          <Button key={palette} variant="solid" palette={palette} size="sm">
            {palette}
          </Button>
        ))}
      </Stack>
    ),
  },
  {
    eyebrow: 'variant — how loud',
    title: 'One intensity ladder per control',
    summary:
      'Every rung answers a single question: how much attention does this action earn on screen.',
    demo: (
      <Stack direction="row" gap="2" wrap>
        {BUTTON_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant} palette="primary" size="sm">
            {variant}
          </Button>
        ))}
      </Stack>
    ),
  },
  {
    eyebrow: 'tone — how loud a glyph speaks',
    title: 'Seven tones for icons',
    summary:
      'The same axis, tuned for icons. The tail runs from plain to muted: context volume at rest.',
    demo: (
      <Stack direction="row" gap="3" wrap>
        {ICON_VARIANTS.map((variant) => (
          <Stack
            key={variant}
            direction="column"
            gap="1-5"
            align="center"
            className={styles.ladderItem}
          >
            <IconButton
              variant={variant}
              palette="primary"
              size="4"
              aria-label={`variant ${variant}`}
            >
              <IconPlus />
            </IconButton>
            <span className={styles.ladderLabel}>{variant}</span>
          </Stack>
        ))}
      </Stack>
    ),
  },
  {
    eyebrow: 'size — how big',
    title: 'Form tiers, shared',
    summary:
      'Four tiers run across the whole form family — a size key is a peer of the variant word.',
    demo: (
      <Stack direction="row" gap="2" align="center" wrap>
        {SIZES.map((size) => (
          <Button key={size} variant="solid" palette="primary" size={size}>
            {size}
          </Button>
        ))}
      </Stack>
    ),
  },
];

const COMPONENTS: { name: string; summary: string; slug: string; demo: ReactNode }[] = [
  {
    name: 'Button',
    summary: 'Action trigger across a five-step intensity ladder',
    slug: 'button',
    demo: (
      <Button size="sm" variant="solid" palette="primary">
        Button
      </Button>
    ),
  },
  {
    name: 'IconButton',
    summary: 'Square icon trigger with a seven-tone scale',
    slug: 'icon-button',
    demo: (
      <Stack direction="row" gap="2">
        <IconButton size="4" variant="plain" palette="primary" aria-label="search">
          <IconSearch />
        </IconButton>
        <IconButton size="4" variant="muted" palette="primary" aria-label="plus">
          <IconPlus />
        </IconButton>
      </Stack>
    ),
  },
  {
    name: 'Input',
    summary: 'Text field sharing the form shell and icon sites',
    slug: 'input',
    demo: <Input size="sm" placeholder="name@colox.dev" />,
  },
  {
    name: 'Select',
    summary: 'Searchable single/multiple picker with chips',
    slug: 'select',
    demo: (
      <Select size="sm" defaultValue="fig">
        <Select.Option value="fig" text="Fig" />
        <Select.Option value="mint" text="Mint" />
        <Select.Option value="date" text="Date" />
      </Select>
    ),
  },
  {
    name: 'Checkbox',
    summary: 'Boolean choice with group plumbing',
    slug: 'checkbox',
    demo: (
      <Stack direction="row" gap="3">
        <Checkbox size="sm" defaultChecked>
          Checked
        </Checkbox>
        <Checkbox size="sm">Empty</Checkbox>
      </Stack>
    ),
  },
  {
    name: 'Radio',
    summary: 'Exclusive choice within a group',
    slug: 'radio',
    demo: (
      <Stack direction="row" gap="3">
        <Radio size="sm" defaultChecked>
          FM
        </Radio>
        <Radio size="sm">AM</Radio>
      </Stack>
    ),
  },
  {
    name: 'Container',
    summary: 'Page-width cap with gutters',
    slug: 'container',
    demo: (
      <Container size="sm" className={styles.miniPanel}>
        <span className={styles.miniPanelLabel}>content</span>
      </Container>
    ),
  },
  {
    name: 'Grid',
    summary: 'Track-based responsive layout',
    slug: 'grid',
    demo: (
      <Grid columns={3} gap="2" className={styles.demoStrip}>
        <span className={styles.miniCell} />
        <span className={styles.miniCell} />
        <span className={styles.miniCell} />
      </Grid>
    ),
  },
  {
    name: 'Stack',
    summary: 'Single-axis layout with wrapping',
    slug: 'stack',
    demo: (
      <Stack direction="column" gap="2" className={styles.demoStrip}>
        <span className={styles.miniCell} />
        <Stack direction="row" gap="2">
          <span className={styles.miniCell} />
          <span className={styles.miniCell} />
          <span className={styles.miniCell} />
        </Stack>
      </Stack>
    ),
  },
];

/**
 * The live theming showcase: an interactive palette picker driving real
 * controls — the "product" moment of the page. Picks render solid,
 * the rest ghost; the trio below proves the same palette travels
 * through different control shapes.
 */
function ThemeShowcase(): ReactNode {
  const [palette, setPalette] = useState<(typeof PALETTES)[number]>('primary');
  return (
    <Grid columns={{ sm: 1, lg: 2 }} gap="8" align="stretch" className={styles.showcaseGrid}>
      <Stack direction="column" gap="3" className={styles.showcaseText}>
        <span className={styles.eyebrow}>theme — opt in</span>
        <h2 className={styles.showcaseTitle}>Themed by tokens, out of the box</h2>
        <p className={styles.showcaseBody}>
          Every color, radius, shadow and duration lives in the CSS variable layer. Light and dark
          ship as complete suites, and semantically named tokens keep the skin in step with the
          theme.
        </p>
        <p className={styles.showcaseBody}>
          Pick a family, then flip the site theme in the corner — the same words hold in both.
        </p>
      </Stack>
      <Stack direction="column" gap="5" align="start" className={styles.showcasePanel}>
        <Stack direction="row" gap="2" wrap>
          {PALETTES.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={p === palette ? 'solid' : 'ghost'}
              palette={p}
              onClick={() => setPalette(p)}
            >
              {p}
            </Button>
          ))}
        </Stack>
        <Stack direction="row" gap="3" align="center" wrap>
          <Button size="md" variant="solid" palette={palette}>
            Action
          </Button>
          <Button size="md" variant="outline" palette={palette}>
            Secondary
          </Button>
          <IconButton size="4" variant="solid" palette={palette} aria-label="confirm">
            <IconCheck />
          </IconButton>
        </Stack>
      </Stack>
    </Grid>
  );
}

// The color-mode context lives inside <Layout>, so the body that
// consumes useColorMode (and wraps ColoxTheme) must sit below it.
// The runtime provider gives the page the responsive breakpoint state
// (Grid/Stack bands) and owns the data-colox-theme attribute; the
// theme prop is controlled by the docusaurus toggle, so both channels
// stay in step.
function HomeContent({ title, tagline }: { title: string; tagline: string }): ReactNode {
  const { colorMode } = useColorMode();
  return (
    <ColoxTheme theme={colorMode === 'dark' ? 'dark' : 'light'}>
      <main className={styles.page}>
        <Container size="md" align="center" className={styles.hero}>
          <p className={styles.eyebrow}>React 19 · TypeScript · Tree-shakable</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.tagline}>{tagline}</p>
          <Stack direction="row" gap="3" justify="center" className={styles.actions}>
            <Link to="/docs/intro">
              <Button variant="solid" palette="primary" size="lg">
                Get Started
              </Button>
            </Link>
            <Link to="https://github.com/wenliangw/colox-react">
              <Button variant="outline" size="lg">
                GitHub
              </Button>
            </Link>
          </Stack>
          <p className={styles.heroMeta}>9 components · 10 icons · 6 palettes · 1 token layer</p>
        </Container>

        <Container size="lg" align="center" className={styles.section}>
          <h2 className={styles.sectionTitle}>One design language, three axes</h2>
          <p className={styles.sectionSub}>
            Palette for meaning, variant for weight, size for scale — every visual choice is one
            named word.
          </p>
          <Stack direction="column" gap="6" className={styles.axes}>
            {AXES.map((axis) => (
              <Grid
                key={axis.eyebrow}
                columns={{ sm: 1, md: 2 }}
                gap="6"
                align="center"
                className={styles.axis}
              >
                <Stack direction="column" gap="1" className={styles.axisHead}>
                  <span className={styles.eyebrow}>{axis.eyebrow}</span>
                  <h3 className={styles.axisTitle}>{axis.title}</h3>
                  <p className={styles.axisSummary}>{axis.summary}</p>
                </Stack>
                <Stack direction="row" justify="start" align="center" className={styles.axisDemo}>
                  {axis.demo}
                </Stack>
              </Grid>
            ))}
          </Stack>
        </Container>

        <Container size="lg" align="center" className={styles.section}>
          <ThemeShowcase />
        </Container>

        <Container size="xl" align="center" className={styles.section}>
          <h2 className={styles.sectionTitle}>Components</h2>
          <p className={styles.sectionSub}>
            Nine primitives today — each one shipped with tests, stories, and MDX docs.
          </p>
          <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="6" className={styles.gallery}>
            {COMPONENTS.map((component) => (
              <div key={component.slug} className={styles.card}>
                <div className={styles.cardDemo}>{component.demo}</div>
                <Link to={`/docs/components/${component.slug}`} className={styles.cardLink}>
                  <Stack direction="column" gap="1" className={styles.cardBody}>
                    <span className={styles.cardTitle}>{component.name}</span>
                    <span className={styles.cardDesc}>{component.summary}</span>
                  </Stack>
                  <IconChevronRight className={styles.cardArrow} aria-hidden="true" />
                </Link>
              </div>
            ))}
          </Grid>
        </Container>

        <Container size="md" align="center" className={styles.section}>
          <h2 className={styles.sectionTitle}>Get started</h2>
          <p className={styles.sectionSub}>
            One dependency, one line of CSS — the whole design language rides along: tokens, themes,
            and the motion gate.
          </p>
          <CodeBlock language="bash" className={styles.code}>{`pnpm add @colox/react`}</CodeBlock>
          <CodeBlock language="tsx" className={styles.code}>{`import { Button } from '@colox/react';
import '@colox/react/style.css';`}</CodeBlock>
          <Link to="/docs/intro" className={styles.readMore}>
            Read the introduction <IconChevronRight aria-hidden="true" />
          </Link>
        </Container>
      </main>
    </ColoxTheme>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="Colox React" description={siteConfig.tagline}>
      <HomeContent title={siteConfig.title} tagline={siteConfig.tagline} />
    </Layout>
  );
}
