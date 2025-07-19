import { useState } from 'preact/hooks';

import type { HeaderRule } from '@/shared/types/rules';
import type { ExtensionSettings } from '@/shared/types/storage';

interface PopupState {
  enabled: boolean;
  rules: HeaderRule[];
  activeRulesCount: number;
  loading: boolean;
  error: string | null;
  settings: ExtensionSettings | null;
  activeProfile: string;
}

export function usePopupState() {
  const [state, setState] = useState<PopupState>({
    enabled: true,
    rules: [],
    activeRulesCount: 0,
    loading: true,
    error: null,
    settings: null,
    activeProfile: 'dev-profile',
  });

  return {
    state,
    setState,
  };
}
