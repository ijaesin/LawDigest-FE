import type { Meta, StoryObj } from '@storybook/react';

function SpacingPage() {
  const spaces = [
    { name: 'space-1', value: '4px', tw: 'gap-1 / p-1' },
    { name: 'space-2', value: '8px', tw: 'gap-2 / p-2' },
    { name: 'space-3', value: '12px', tw: 'gap-3 / p-3' },
    { name: 'space-4', value: '16px', tw: 'gap-4 / p-4' },
    { name: 'space-6', value: '24px', tw: 'gap-6 / p-6' },
    { name: 'space-8', value: '32px', tw: 'gap-8 / p-8' },
    { name: 'space-12', value: '48px', tw: 'gap-12 / p-12' },
    { name: 'space-16', value: '64px', tw: 'gap-16 / p-16' },
  ];
  return (
    <div className="space-y-3">
      {spaces.map((s) => (
        <div key={s.name} className="flex items-center gap-4">
          <div className="w-24 text-sm font-medium">{s.name}</div>
          <div className="bg-primary rounded-sm" style={{ width: s.value, height: '16px' }} />
          <div className="text-muted-foreground text-sm">
            {s.value} — <code>{s.tw}</code>
          </div>
        </div>
      ))}
    </div>
  );
}

const meta: Meta = { title: 'Design Tokens/Spacing' };
export default meta;
export const SpacingScale: StoryObj = { render: () => <SpacingPage /> };
