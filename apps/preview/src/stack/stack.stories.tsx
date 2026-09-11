import type { Meta, StoryObj } from '@storybook/react';
import { Container, Stack } from '@colox/react';
import { Section, bound, track } from '../showcase/section';

const demoBox = {
  background: 'var(--colox-color-bg-muted)',
  border: '1px solid var(--colox-color-border-muted)',
  borderRadius: 'var(--colox-radius-sm)',
  padding: 'var(--colox-spacing-3) var(--colox-spacing-4)',
} as const;

const Demo = ({ label }: { label: string }) => (
  <Stack.Item style={demoBox}>
    <span>{label}</span>
  </Stack.Item>
);

const meta: Meta<typeof Stack> = {
  title: 'Components/Stack',
  component: Stack,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A one-dimensional flex layout with direction, gap, alignment, a grow spacer and a responsive gap child.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Stack>;

export const Overview: Story = {
  render: () => (
    <>
      <Container size="md" gutter="4">
        <Stack direction="column" gap="8">
          <Section title="Direction">
            <Stack direction="column" gap="2">
              <Stack direction="row" gap="2" style={track}>
                <Demo label="row" />
                <Demo label="default" />
              </Stack>
              <Stack direction="row-reverse" gap="2" style={track}>
                <Demo label="row-reverse" />
                <Demo label="end first" />
              </Stack>
              <Stack direction="column" gap="2" style={track}>
                <Demo label="column" />
                <Demo label="top first" />
              </Stack>
              <Stack direction="column-reverse" gap="2" style={track}>
                <Demo label="column-reverse" />
                <Demo label="bottom first" />
              </Stack>
            </Stack>
          </Section>

          <Section title="Gap scale">
            <Stack direction="column" gap="2">
              {(['1', '2', '4', '8', '16'] as const).map((gap) => (
                <Stack key={gap} gap={gap} style={bound()}>
                  <Demo label={`gap ${gap}`} />
                  <Demo label="x" />
                </Stack>
              ))}
            </Stack>
          </Section>

          <Section title="Alignment">
            <Stack direction="column" gap="2">
              {(['start', 'center', 'stretch'] as const).map((align) => (
                <Stack key={align} align={align} gap="2" style={track}>
                  <Demo label={align} />
                  <Demo label="taller" />
                </Stack>
              ))}
            </Stack>
          </Section>

          <Section title="Grow spacer">
            <Stack gap="2" style={bound()}>
              <Demo label="Logo" />
              <Stack.Item grow />
              <Demo label="Settings" />
              <Demo label="Avatar" />
            </Stack>
          </Section>
        </Stack>
      </Container>

      <Stack
        direction="column"
        gap="2"
        style={{
          paddingInline: 'var(--colox-spacing-4)',
          paddingBlockEnd: 'var(--colox-spacing-6)',
        }}
      >
        <Section title="Responsive gap">
          <Stack gap="4">
            <Stack.Responsive gap={{ sm: '2', md: '4', lg: '8' }} />
            <Demo label="Resize the viewport" />
            <Demo label="gap follows the band" />
            <Demo label="sm 2 · md 4 · lg 8" />
          </Stack>
        </Section>
      </Stack>
    </>
  ),
};
