export type KeenIconsStyleType = 'duotone' | 'filled' | 'solid' | 'outline';

export interface IKeenIconsProps {
  icon: string;
  style?: KeenIconsStyleType;
  className?: string;
}
