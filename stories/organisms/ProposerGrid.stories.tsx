import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ProposerGrid } from '@/app/common/components/organisms';

const mockRepresentative = [
  {
    representative_proposer_id: 'C001',
    representative_proposer_name: '김민수',
    represent_proposer_img_url: '',
    party_id: 1,
    party_image_url: '',
    party_name: '더불어민주당',
  },
];

const mockPublic = Array.from({ length: 10 }, (_, i) => ({
  public_proposer_id: `P${String(i + 1).padStart(3, '0')}`,
  public_proposer_name: `의원${i + 1}`,
  public_proposer_img_url: '',
  public_proposer_party_id: (i % 2) + 1,
  public_proposer_party_image_url: '',
  public_proposer_party_name: i % 2 === 0 ? '더불어민주당' : '국민의힘',
}));

const meta: Meta<typeof ProposerGrid> = {
  title: 'Organisms/ProposerGrid',
  component: ProposerGrid,
  args: {
    representativeProposers: mockRepresentative,
    publicProposers: mockPublic,
  },
};
export default meta;
type Story = StoryObj<typeof ProposerGrid>;

export const Default: Story = {};

export const FewPublicProposers: Story = {
  args: {
    publicProposers: mockPublic.slice(0, 3),
  },
};

export const NoPublicProposers: Story = {
  args: {
    publicProposers: [],
  },
};
