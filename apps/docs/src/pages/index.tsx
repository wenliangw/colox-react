import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useColorMode } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import { Button, Container, Grid, IconButton, Input, Stack } from '@colox/react';
import { ColoxTheme } from '@colox/theme';
import { IconChevronRight, IconPlus } from '@colox/icons';
import '@colox/react/style.css';
import styles from './index.module.css';

const PALETTES = ['primary', 'gray', 'info', 'error', 'warning', 'success'] as const;
const VARIANTS = ['solid', 'subtle', 'surface', 'outline', 'ghost'] as const;
const SIZES = ['xs', 'sm', 'md', 'lg'] as const;

type Palette = (typeof PALETTES)[number];
type Variant = (typeof VARIANTS)[number];
type Size = (typeof SIZES)[number];

/**
 * The six semantic families — the library's color signature. `tone`
 * carries a family's token trio (solid / muted / subtle) through CSS
 * variables, so one class drives the spectrum strip and any accent dot.
 */
const FAMILIES = [
  { palette: 'primary', label: 'primary', tone: styles.familyBrand },
  { palette: 'gray', label: 'gray', tone: styles.familyGray },
  { palette: 'info', label: 'info', tone: styles.familyBlue },
  { palette: 'error', label: 'error', tone: styles.familyRed },
  { palette: 'warning', label: 'warning', tone: styles.familyOrange },
  { palette: 'success', label: 'success', tone: styles.familyGreen },
] as const;

/** The design philosophy: three ideas, not a component catalogue. */
const PRINCIPLES = [
  {
    eyebrow: 'meaning, not mood',
    title: 'Semantics before decoration',
    body: 'Palette answers what an action means, never how it feels. Every control defaults to gray, so an accent is always an opt-in decision — a page can only shout where it deserves to.',
  },
  {
    eyebrow: 'one axis per question',
    title: 'Every choice is one named word',
    body: 'Variant answers how loud, size how big, palette what it means. Three closed vocabularies replace a thousand ad-hoc class names, and any combination stays predictable.',
  },
  {
    eyebrow: 'tokens all the way down',
    title: 'The skin belongs to the product',
    body: 'Colors, radii, shadows and durations live in the token layer. Swap a token, ship a theme — light and dark are complete suites, and the motion gate honours reduced-motion for free.',
  },
];

const USE_CASES: { title: string; body: string; tag: string; tone: string }[] = [
  {
    title: 'Data-dense products',
    body: 'Dashboards and admin surfaces where controls must read the same in every corner of the app: one ladder, one size scale, no drift.',
    tag: 'console · admin',
    tone: styles.familyBrand,
  },
  {
    title: 'Multi-theme products',
    body: 'White-label and customer-branded apps: the six families re-tint through tokens, so a partner skin is a config change, not a fork.',
    tag: 'white-label',
    tone: styles.familyBlue,
  },
  {
    title: 'Design-system foundations',
    body: 'Start from a token contract instead of a component pile: the Figma pipeline compiles the design language into CSS variables your team can own.',
    tag: 'tokens · figma',
    tone: styles.familyGreen,
  },
  {
    title: 'Interfaces written with AI',
    body: 'Agents ship correct Colox code because the doctrine is packaged for them: a wiki bundle plus an MCP server that answers rules and APIs on demand.',
    tag: 'agents · mcp',
    tone: styles.familyOrange,
  },
];

/** The AI-native half: the wiki doctrine package and its bundle layers. */
const WIKI_BUNDLES = [
  {
    name: 'AGENTS.md',
    kind: 'doctrine digest',
    summary:
      'The compact digest every harness reads first: token-driven styling, tree-shaking, and the read order into the deeper layers.',
  },
  {
    name: 'components.md',
    kind: 'component map',
    summary:
      'Responsibility and shipped status per primitive — the answer to "does this library already have it?".',
  },
  {
    name: 'skills/doctrine',
    kind: 'bundle',
    summary:
      'The doctrine manual plus the global rules, each pair written as must / avoid with the reason attached.',
  },
  {
    name: 'skills/style',
    kind: 'bundle',
    summary:
      'Styling wiring: importing the aggregate CSS, the token grid, theming, and the override discipline.',
  },
  {
    name: 'skills/<component>',
    kind: 'bundle',
    summary:
      'One bundle per component topic — the recipe in SKILL.md, and references/ holding rules and the API reference read on demand.',
  },
] as const;

/** The AI-native half: the official MCP server and its four tools. */
const MCP_TOOLS = [
  {
    name: 'search_doctrine',
    signature: 'search_doctrine(query, kind?)',
    summary:
      'Full-text search across every bundle and reference, scored, and returned with the read pointer for the hit.',
    sample: 'skills/style · references/rules.md\n“Every color, radius and duration is a token.”',
  },
  {
    name: 'get_rule',
    signature: 'get_rule(name?)',
    summary: 'Conditional rules as must / avoid pairs. `global` reads the doctrine-wide set.',
    sample:
      'global\nmust — style through className + tokens\navoid — inline style objects, raw hex',
  },
  {
    name: 'get_skill',
    signature: 'get_skill(name, reference?)',
    summary: 'A bundle recipe, or one of its references pulled on demand.',
    sample: 'skills/grid/SKILL.md\n→ references/component.md (API, on demand)',
  },
  {
    name: 'get_component',
    signature: 'get_component(name?)',
    summary: 'Without arguments: the whole component map. With a name: that primitive in detail.',
    sample:
      'nine primitives\nButton · IconButton · Input · Select · Checkbox · Radio · Container · Grid · Stack',
  },
] as const;

const HARNESSES = [
  { name: 'Claude', line: 'claude mcp add colox -- npx -y @colox/mcp' },
  { name: 'Codex', line: '[mcp_servers.colox]\ncommand = "npx"\nargs = ["-y", "@colox/mcp"]' },
  { name: 'Cursor / dsh', line: 'npx -y @colox/mcp' },
] as const;

/** The compile-time half: the theme-builder CLI. */
const CLI_RUNS = [
  {
    name: 'colox theme build',
    note: 'Compiles the shipped design language into the dist of the consuming app.',
    output: [
      '· config   colox.theme.build.json (discovered from cwd)',
      '· tokens   base tokens → light + dark suites',
      '· themes   theme overrides → palette-axis files',
      '· runtime  breakpoints + key tables → TypeScript',
      '✓ wrote    index.css · themes/*.css',
    ],
  },
  {
    name: 'colox theme build -c ./colox.theme.json',
    note: 'A custom theme compiled over the shipped tokens — the -c flag beats the config field.',
    output: [
      '· config   ./colox.theme.json (explicit)',
      '· tokens   shipped base tokens',
      "· themes   custom theme → :root[data-colox-theme='<name>']",
      '✓ wrote    themes/<name>.css',
    ],
  },
] as const;

const COMPONENTS = [
  { name: 'Button', slug: 'button' },
  { name: 'IconButton', slug: 'icon-button' },
  { name: 'Input', slug: 'input' },
  { name: 'Select', slug: 'select' },
  { name: 'Checkbox', slug: 'checkbox' },
  { name: 'Radio', slug: 'radio' },
  { name: 'Container', slug: 'container' },
  { name: 'Grid', slug: 'grid' },
  { name: 'Stack', slug: 'stack' },
] as const;

/** A copyable install command — the smallest useful interaction. */
function CopyChip({ command }: { command: string }): ReactNode {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={styles.installChip}
      onClick={() => {
        navigator.clipboard?.writeText(command).catch(() => undefined);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      <code>{command}</code>
      <span className={styles.installState}>{copied ? 'copied' : 'copy'}</span>
    </button>
  );
}

/**
 * The hero playground: three axes on the left, a real product scene on
 * the right — and the JSX it takes to build it, updating as you pick.
 * Interaction is the product demo.
 */
function Playground(): ReactNode {
  const [palette, setPalette] = useState<Palette>('primary');
  const [variant, setVariant] = useState<Variant>('solid');
  const [size, setSize] = useState<Size>('md');
  return (
    <div className={styles.playground}>
      <div className={styles.panelHead}>
        <span className={styles.panelLabel}>playground</span>
        <span className={styles.panelHint}>live</span>
      </div>
      <div className={styles.ctlRow}>
        <span className={styles.ctlKey}>palette</span>
        <Stack direction="row" gap="1-5" wrap>
          {PALETTES.map((p) => (
            <Button
              key={p}
              size="xs"
              variant={p === palette ? 'solid' : 'ghost'}
              palette={p}
              onClick={() => setPalette(p)}
            >
              {p}
            </Button>
          ))}
        </Stack>
      </div>
      <div className={styles.ctlRow}>
        <span className={styles.ctlKey}>variant</span>
        <Stack direction="row" gap="1-5" wrap>
          {VARIANTS.map((v) => (
            <Button
              key={v}
              size="xs"
              variant={v === variant ? 'solid' : 'ghost'}
              palette="gray"
              onClick={() => setVariant(v)}
            >
              {v}
            </Button>
          ))}
        </Stack>
      </div>
      <div className={styles.ctlRow}>
        <span className={styles.ctlKey}>size</span>
        <Stack direction="row" gap="1-5" wrap>
          {SIZES.map((s) => (
            <Button
              key={s}
              size="xs"
              variant={s === size ? 'solid' : 'ghost'}
              palette="gray"
              onClick={() => setSize(s)}
            >
              {s}
            </Button>
          ))}
        </Stack>
      </div>
      <div className={styles.stage}>
        <Input size={size} placeholder="Project name" />
        <Stack direction="row" gap="2" wrap>
          <Button variant={variant} palette={palette} size={size}>
            Create
          </Button>
          <Button variant="ghost" palette={palette} size={size}>
            Cancel
          </Button>
        </Stack>
      </div>
      <code className={styles.stageCode}>
        {`<Button variant="${variant}" palette="${palette}" size="${size}">Create</Button>`}
      </code>
    </div>
  );
}

/** Wiki bundle explorer: pick a layer, read what the agent gets. */
function WikiExplorer(): ReactNode {
  const [active, setActive] = useState(0);
  const bundle = WIKI_BUNDLES[active];
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelLabel}>@colox/wiki</span>
        <span className={styles.panelHint}>markdown only</span>
      </div>
      <div className={styles.explorer}>
        <Stack direction="column" gap="1" className={styles.explorerList}>
          {WIKI_BUNDLES.map((item, index) => (
            <button
              key={item.name}
              type="button"
              className={`${styles.explorerItem} ${index === active ? styles.explorerItemActive : ''}`}
              onClick={() => setActive(index)}
            >
              {item.name}
            </button>
          ))}
        </Stack>
        <div className={styles.explorerDetail}>
          <span className={styles.explorerKind}>{bundle.kind}</span>
          <p className={styles.explorerText}>{bundle.summary}</p>
        </div>
      </div>
    </div>
  );
}

/** MCP explorer: pick a tool, read its signature and a sample answer. */
function McpExplorer(): ReactNode {
  const [active, setActive] = useState(0);
  const tool = MCP_TOOLS[active];
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelLabel}>@colox/mcp</span>
        <span className={styles.panelHint}>stdio · offline</span>
      </div>
      <div className={styles.explorer}>
        <Stack direction="column" gap="1" className={styles.explorerList}>
          {MCP_TOOLS.map((item, index) => (
            <button
              key={item.name}
              type="button"
              className={`${styles.explorerItem} ${index === active ? styles.explorerItemActive : ''}`}
              onClick={() => setActive(index)}
            >
              {item.name}
            </button>
          ))}
        </Stack>
        <div className={styles.explorerDetail}>
          <code className={styles.explorerSignature}>{tool.signature}</code>
          <p className={styles.explorerText}>{tool.summary}</p>
          <pre className={styles.explorerSample}>{tool.sample}</pre>
        </div>
      </div>
    </div>
  );
}

/** CLI terminal: pick a command, watch the pipeline report. */
function CliTerminal(): ReactNode {
  const [active, setActive] = useState(0);
  const run = CLI_RUNS[active];
  return (
    <div className={styles.terminal}>
      <div className={styles.terminalBar}>
        <Stack direction="row" gap="1-5" wrap className={styles.terminalTabs}>
          {CLI_RUNS.map((item, index) => (
            <button
              key={item.name}
              type="button"
              className={`${styles.terminalTab} ${index === active ? styles.terminalTabActive : ''}`}
              onClick={() => setActive(index)}
            >
              {item.name}
            </button>
          ))}
        </Stack>
        <span className={styles.panelHint}>@colox/theme-builder</span>
      </div>
      <pre className={styles.terminalBody}>
        <span className={styles.terminalPrompt}>$ </span>
        {run.name}
        {'\n'}
        {run.output.join('\n')}
      </pre>
      <p className={styles.terminalNote}>{run.note}</p>
    </div>
  );
}

/** Token theming: pick a family, watch real controls re-tint. */
function ThemeSwitcher(): ReactNode {
  const [palette, setPalette] = useState<Palette>('primary');
  return (
    <Stack
      direction="column"
      gap="5"
      align="start"
      justify="center"
      className={styles.showcasePanel}
    >
      <Stack direction="row" gap="1-5" wrap>
        {PALETTES.map((p) => (
          <Button
            key={p}
            size="xs"
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
          <IconPlus />
        </IconButton>
      </Stack>
    </Stack>
  );
}

// The color-mode context lives inside <Layout>, so the body that
// consumes useColorMode (and wraps ColoxTheme) must sit below it.
// The runtime provider gives the page the responsive breakpoint state
// (Grid/Stack bands) and owns the data-colox-theme attribute; the
// theme prop is controlled by the docusaurus toggle, so both channels
// stay in step.
function HomeContent(): ReactNode {
  const { colorMode } = useColorMode();
  const [harness, setHarness] = useState(0);
  return (
    <ColoxTheme theme={colorMode === 'dark' ? 'dark' : 'light'}>
      <main className={styles.page}>
        <div className={styles.heroBand}>
          <Container size="xl" className={styles.heroWrap}>
            <Grid columns={{ sm: 1, lg: 2 }} gap="10" align="center" className={styles.hero}>
              <Stack direction="column" gap="5" align="start" className={styles.heroText}>
                <Link to="/docs/intro" className={styles.pill}>
                  AI-native component library — doctrine shipped with the code
                  <IconChevronRight aria-hidden="true" />
                </Link>
                <h1 className={styles.title}>
                  A component library with <span className={styles.hl}>one design language</span>
                </h1>
                <p className={styles.tagline}>
                  Nine primitives, one token layer, and the doctrine your agents read — so every
                  screen a team ships looks like it came from the same hand.
                </p>
                <Stack direction="row" gap="3" wrap className={styles.actions}>
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
                <CopyChip command="pnpm add @colox/react" />
              </Stack>
              <Playground />
            </Grid>
          </Container>
        </div>
        <div className={styles.spectrum} aria-hidden="true">
          {FAMILIES.map((family) => (
            <span key={family.palette} className={`${styles.spectrumPart} ${family.tone}`} />
          ))}
        </div>

        <Container size="lg" align="center" className={styles.section}>
          <h2 className={styles.sectionTitle}>A language, not a pile of styles</h2>
          <p className={styles.sectionSub}>
            Three ideas decide every pixel; the components are just where they show up.
          </p>
          <Grid columns={{ sm: 1, md: 3 }} gap="6" className={styles.principles}>
            {PRINCIPLES.map((principle) => (
              <Stack
                key={principle.title}
                direction="column"
                gap="2"
                align="start"
                className={styles.principle}
              >
                <span className={styles.eyebrow}>{principle.eyebrow}</span>
                <h3 className={styles.principleTitle}>{principle.title}</h3>
                <p className={styles.principleBody}>{principle.body}</p>
              </Stack>
            ))}
          </Grid>
        </Container>

        <Container size="xl" align="center" className={styles.section}>
          <h2 className={styles.sectionTitle}>Built for</h2>
          <p className={styles.sectionSub}>
            Where a single design language pays for itself — dense products, skinned products, and
            products written with agents.
          </p>
          <Grid columns={{ sm: 1, md: 2 }} gap="6" className={styles.useCases}>
            {USE_CASES.map((useCase) => (
              <Stack
                key={useCase.title}
                direction="column"
                gap="3"
                align="start"
                className={`${styles.useCase} ${useCase.tone}`}
              >
                <span className={styles.useCaseDot} aria-hidden="true" />
                <h3 className={styles.useCaseTitle}>{useCase.title}</h3>
                <p className={styles.useCaseBody}>{useCase.body}</p>
                <span className={styles.useCaseTag}>{useCase.tag}</span>
              </Stack>
            ))}
          </Grid>
        </Container>

        <Container size="xl" align="center" className={styles.section}>
          <h2 className={styles.sectionTitle}>AI-native by design</h2>
          <p className={styles.sectionSub}>
            The same doctrine that governs us ships as data for your agents: a wiki bundle they
            read, and an MCP server that answers on demand.
          </p>
          <Grid columns={{ sm: 1, lg: 2 }} gap="6" className={styles.aiGrid}>
            <WikiExplorer />
            <McpExplorer />
          </Grid>
          <div className={styles.harness}>
            <div className={styles.panelHead}>
              <span className={styles.panelLabel}>wire it into your harness</span>
              <span className={styles.panelHint}>one line</span>
            </div>
            <Stack direction="row" gap="2" wrap className={styles.harnessTabs}>
              {HARNESSES.map((item, index) => (
                <Button
                  key={item.name}
                  size="xs"
                  variant={index === harness ? 'solid' : 'ghost'}
                  palette="gray"
                  onClick={() => setHarness(index)}
                >
                  {item.name}
                </Button>
              ))}
            </Stack>
            <pre className={styles.harnessBody}>{HARNESSES[harness].line}</pre>
          </div>
        </Container>

        <Container size="xl" align="center" className={styles.section}>
          <h2 className={styles.sectionTitle}>Compile your own design language</h2>
          <p className={styles.sectionSub}>
            Figma tokens in, CSS variables and typed constants out — the pipeline is a package, not
            a service.
          </p>
          <CliTerminal />
        </Container>

        <Container size="lg" align="center" className={styles.section}>
          <h2 className={styles.sectionTitle}>Themes ship as suites</h2>
          <p className={styles.sectionSub}>
            Light and dark are complete token sets, not filters — pick a family and watch real
            controls re-tint, then flip the site theme in the corner.
          </p>
          <Grid columns={{ sm: 1, lg: 2 }} gap="8" align="stretch" className={styles.showcaseGrid}>
            <Stack direction="column" gap="3" className={styles.showcaseText}>
              <span className={styles.eyebrow}>token layer</span>
              <h3 className={styles.showcaseTitle}>One variable swap, the whole skin follows</h3>
              <p className={styles.showcaseBody}>
                Components never carry raw colors — they read semantic tokens, so a theme change is
                a variable change. That is what makes white-labelling a config file instead of a
                fork.
              </p>
            </Stack>
            <ThemeSwitcher />
          </Grid>
        </Container>

        <Container size="md" align="center" className={styles.section}>
          <h2 className={styles.sectionTitle}>Get started</h2>
          <p className={styles.sectionSub}>
            One dependency, one line of CSS — tokens, themes and the motion gate ride along.
          </p>
          <CodeBlock language="bash" className={styles.code}>{`pnpm add @colox/react`}</CodeBlock>
          <CodeBlock language="tsx" className={styles.code}>{`import { Button } from '@colox/react';
import '@colox/react/style.css';`}</CodeBlock>
          <Stack direction="row" gap="2" wrap justify="center" className={styles.componentNav}>
            {COMPONENTS.map((component) => (
              <Link
                key={component.slug}
                to={`/docs/components/${component.slug}`}
                className={styles.componentLink}
              >
                {component.name}
              </Link>
            ))}
          </Stack>
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
      <HomeContent />
    </Layout>
  );
}
