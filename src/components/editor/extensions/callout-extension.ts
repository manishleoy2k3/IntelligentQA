import { Node, mergeAttributes } from '@tiptap/core';

export type CalloutType = 'info' | 'warning' | 'important' | 'tip' | 'best-practice';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes?: { type?: CalloutType }) => ReturnType;
      toggleCallout: (attributes?: { type?: CalloutType }) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-callout-type') || 'info',
        renderHTML: (attributes) => ({
          'data-callout-type': attributes.type || 'info',
          class: `tiptap-callout tiptap-callout-${attributes.type || 'info'}`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout-type]',
      },
      {
        tag: 'div.tiptap-callout',
      },
      {
        tag: 'div.callout-box',
        getAttrs: (element) => {
          if (typeof element === 'string') return {};
          const el = element as HTMLElement;
          const cls = el.className || '';
          let type: CalloutType = 'info';
          if (cls.includes('warning')) type = 'warning';
          else if (cls.includes('important')) type = 'important';
          else if (cls.includes('tip')) type = 'tip';
          else if (cls.includes('best-practice')) type = 'best-practice';
          return { type };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes);
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },
});
