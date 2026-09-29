import type { ProgressStrategy } from '@colox/react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Container, Progress, Stack, useProgressStrategy } from '@colox/react';
import { Hint, Section } from '../showcase/section';

const meta: Meta<typeof Progress.Linear> = {
  title: 'Components/Progress',
  component: Progress.Linear,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The progress family — `Progress.Linear` is the horizontal progress bar: a track fabric with a filled bar grown to the committed percent (0–100), or, without a `value`, an indeterminate sweeping block that signals in-flight work without a number. `palette` (six design-language families, brand by default) picks the bar color — success stays `palette="success"`, failure `palette="error"`. `size` (sm/md/lg) picks the stripe thickness; `showInfo` (default on, determinate only) shows the trailing `n%` and `format` rewrites it. Pure display — no events, consumers drive the value from their store. The `useProgressStrategy` hook pairs with it for the classic top-of-page route bar: fast-then-slow automatic growth to a cap, then a committed `done`.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Progress.Linear>;

export const Overview: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Stack direction="column" gap="8">
        <Section title="Values">
          <Stack direction="column" gap="4" align="stretch">
            <Progress.Linear value={0} />
            <Progress.Linear value={30} />
            <Progress.Linear value={60} />
            <Progress.Linear value={100} />
            <Hint>the bar grows to the committed 0–100 percent</Hint>
          </Stack>
        </Section>

        <Section title="Indeterminate">
          <Stack direction="column" gap="4" align="stretch">
            <Progress.Linear />
            <Hint>
              without a value the bar sweeps — signals in-flight work, announces no number
            </Hint>
          </Stack>
        </Section>

        <Section title="Palette">
          <Stack direction="column" gap="4" align="stretch">
            <Progress.Linear value={60} palette="primary" />
            <Progress.Linear value={60} palette="gray" />
            <Progress.Linear value={60} palette="info" />
            <Progress.Linear value={60} palette="success" />
            <Progress.Linear value={60} palette="warning" />
            <Progress.Linear value={60} palette="error" />
            <Hint>success = green, failure = red — the semantic color is your call</Hint>
          </Stack>
        </Section>

        <Section title="Sizes">
          <Stack direction="column" gap="4" align="stretch">
            <Progress.Linear value={60} size="sm" />
            <Progress.Linear value={60} size="md" />
            <Progress.Linear value={60} size="lg" />
            <Hint>sm · md (default) · lg — stripe thickness 4/6/8px</Hint>
          </Stack>
        </Section>

        <Section title="Info">
          <Stack direction="column" gap="4" align="stretch">
            <Progress.Linear value={60} />
            <Progress.Linear value={60} showInfo={false} />
            <Progress.Linear value={4} format={(percent) => `${percent} / 5 files done`} />
            <Hint>showInfo (default on) · format rewrites the trailing label</Hint>
          </Stack>
        </Section>
      </Stack>
    </Container>
  ),
};

function RouteLoadingDemo({ strategy, hint }: { strategy?: ProgressStrategy; hint?: string }) {
  const { value, start, done, reset } = useProgressStrategy(strategy ? { strategy } : undefined);

  return (
    <Stack direction="column" gap="4" align="stretch">
      <Stack direction="row" gap="2">
        <Button size="sm" onClick={start}>
          Start
        </Button>
        <Button size="sm" onClick={done}>
          Done
        </Button>
        <Button size="sm" onClick={reset}>
          Reset
        </Button>
      </Stack>
      <Progress.Linear value={value} />
      <Hint>
        {hint ??
          'start — the value creeps toward 99% fast-then-slow and parks · done — commits to 100% · reset — the next route'}
      </Hint>
    </Stack>
  );
}

// Slopes are deliberately staged so each segment reads as its own
// pace: 100%/s sprint → 50%/s even pace → 21.7%/s crawl. (The previous
// example, [['20%',300],['60%',600],['99%',1000]], had equal slopes on
// its first two segments — 20/300 = 40/600 — which read as a single
// straight line.)
const segmentedStrategy: ProgressStrategy = [
  ['20%', 200],
  ['40%', 800],
  ['99%', 10000],
];

export const RouteLoading: Story = {
  render: () => (
    <Container size="md" gutter="4">
      <Section title="Route loading — default curve">
        <RouteLoadingDemo />
      </Section>
      <Section title="Route loading — segmented strategy">
        <RouteLoadingDemo
          strategy={segmentedStrategy}
          hint="three distinct paces: 0→20% sprint in 200ms · 20→60% even over 800ms · 60→99% crawl over 1.8s — each knee changes the bar's speed"
        />
      </Section>
    </Container>
  ),
};
