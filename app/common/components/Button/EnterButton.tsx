import { Button } from '@/app/common/components/ui/button';
import { IconArrowRight } from '@/public/svgs';

export default function EnterButton() {
  return (
    <Button variant="ghost" size="icon">
      <IconArrowRight />
    </Button>
  );
}
