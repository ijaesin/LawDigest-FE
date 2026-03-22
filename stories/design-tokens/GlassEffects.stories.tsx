import type { Meta, StoryObj } from '@storybook/react';

function GlassEffectsPage() {
  return (
    <div
      className="space-y-8"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
        padding: '2rem',
        borderRadius: '1rem',
      }}>
      <div className="glass-subtle rounded-md p-6">
        <h3 className="glass-text-safe font-semibold">Glass Subtle</h3>
        <p className="glass-text-safe text-sm">40% opacity, 8px blur</p>
      </div>
      <div className="glass-medium rounded-md p-6">
        <h3 className="glass-text-safe font-semibold">Glass Medium</h3>
        <p className="glass-text-safe text-sm">60% opacity, 16px blur</p>
      </div>
      <div className="glass-heavy rounded-md p-6">
        <h3 className="glass-text-safe font-semibold">Glass Heavy</h3>
        <p className="glass-text-safe text-sm">80% opacity, 24px blur</p>
      </div>
    </div>
  );
}

const meta: Meta = { title: 'Design Tokens/Glass Effects' };
export default meta;
export const AllLevels: StoryObj = { render: () => <GlassEffectsPage /> };
