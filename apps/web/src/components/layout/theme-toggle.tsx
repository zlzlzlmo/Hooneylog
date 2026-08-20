'use client';

import { useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { applyTheme, getStoredTheme, subscribeToTheme, type Theme } from '@/lib/theme';

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: '라이트 모드', Icon: Sun },
  { value: 'dark', label: '다크 모드', Icon: Moon },
  { value: 'system', label: '시스템 설정 따르기', Icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  // Server snapshot is 'system' so the markup matches before hydration.
  const theme = useSyncExternalStore(subscribeToTheme, getStoredTheme, () => 'system' as Theme);

  return (
    <ToggleGroup
      variant="outline"
      type="single"
      size="sm"
      value={theme}
      onValueChange={(next) => next && applyTheme(next as Theme)}
      aria-label="테마 선택"
      className={className}
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <ToggleGroupItem key={value} value={value} aria-label={label} title={label}>
          <Icon />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
