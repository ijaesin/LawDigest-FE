import type { Meta, StoryObj } from '@storybook/react';

function ColorSwatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-md border" style={{ background: `hsl(var(${cssVar}))` }} />
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="text-muted-foreground text-xs">{cssVar}</p>
      </div>
    </div>
  );
}

function ColorsPage() {
  const colors = [
    { name: 'Primary', cssVar: '--primary' },
    { name: 'Primary Hover', cssVar: '--primary-hover' },
    { name: 'Primary Subtle', cssVar: '--primary-subtle' },
    { name: 'Accent', cssVar: '--accent' },
    { name: 'Accent Subtle', cssVar: '--accent-subtle' },
    { name: 'Warning', cssVar: '--warning' },
    { name: 'Danger', cssVar: '--danger' },
    { name: 'Background', cssVar: '--background' },
    { name: 'Surface', cssVar: '--surface' },
    { name: 'Foreground', cssVar: '--foreground' },
    { name: 'Muted Foreground', cssVar: '--muted-foreground' },
    { name: 'Tertiary Foreground', cssVar: '--tertiary-foreground' },
    { name: 'Border', cssVar: '--border' },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {colors.map((c) => (
        <ColorSwatch key={c.cssVar} name={c.name} cssVar={c.cssVar} />
      ))}
    </div>
  );
}

const meta: Meta = { title: 'Design Tokens/Colors' };
export default meta;
export const AllColors: StoryObj = { render: () => <ColorsPage /> };
