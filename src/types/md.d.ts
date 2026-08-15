import type { DetailedHTMLProps, HTMLAttributes, Ref } from 'react';

// Minimal JSX intrinsics for the @material/web elements we mount from React.
// Only the props we actually use are typed; the rest fall back to HTMLAttributes.
type MdBase<T = HTMLElement> = DetailedHTMLProps<HTMLAttributes<T>, T> & {
  ref?: Ref<T>;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-switch': MdBase & {
        selected?: boolean;
        disabled?: boolean;
        icons?: boolean;
        'show-only-selected-icon'?: boolean;
      };
      'md-filled-button': MdBase & { disabled?: boolean; type?: 'button' | 'submit' | 'reset' };
      'md-filled-tonal-button': MdBase & { disabled?: boolean; type?: 'button' | 'submit' | 'reset' };
      'md-text-button': MdBase & { disabled?: boolean; type?: 'button' | 'submit' | 'reset' };
      'md-outlined-segmented-button-set': MdBase & { multiselect?: boolean };
      'md-outlined-segmented-button': MdBase & { selected?: boolean; label?: string; disabled?: boolean };
      'md-icon': MdBase;
      'md-outlined-button': MdBase & { disabled?: boolean; type?: 'button' | 'submit' | 'reset' };
      'md-icon-button': MdBase & { disabled?: boolean; toggle?: boolean; selected?: boolean };
      'md-dialog': MdBase & { open?: boolean; quick?: boolean; type?: string };
      'md-outlined-text-field': MdBase & {
        label?: string;
        value?: string;
        type?: string;
        inputmode?: string;
        min?: string;
        max?: string;
        maxlength?: number;
        'no-spinner'?: boolean;
      };
    }
  }
}

export {};
