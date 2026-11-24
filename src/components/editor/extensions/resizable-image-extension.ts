import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

export interface CustomImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customImage: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: string | number;
        alignment?: 'left' | 'center' | 'right';
        caption?: string;
      }) => ReturnType;
    };
  }
}

export const ResizableImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            style: `width: ${attributes.width}; max-width: 100%; height: auto;`,
          };
        },
      },
      alignment: {
        default: 'center',
        renderHTML: (attributes) => {
          const align = attributes.alignment || 'center';
          return {
            'data-alignment': align,
            class: `tiptap-img-${align}`,
          };
        },
      },
      caption: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.caption) return {};
          return {
            'data-caption': attributes.caption,
          };
        },
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { alignment, caption, ...rest } = HTMLAttributes;
    const alignClass = `tiptap-image-wrapper tiptap-image-${alignment || 'center'}`;

    return [
      'div',
      { class: alignClass },
      [
        'img',
        mergeAttributes(this.options.HTMLAttributes, rest, {
          class: 'rounded-xl shadow-md border border-neutral-700/50 my-2 object-contain',
        }),
      ],
      ...(caption
        ? [
            [
              'p',
              {
                class: 'text-center text-xs text-zinc-400 dark:text-neutral-400 italic mt-1 mb-3',
              },
              caption,
            ],
          ]
        : []),
    ];
  },
});
