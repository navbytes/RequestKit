import { Icon } from '@/shared/components/Icon';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Icon name="loader" size={32} className="animate-spin text-primary-500" />
    </div>
  );
}
