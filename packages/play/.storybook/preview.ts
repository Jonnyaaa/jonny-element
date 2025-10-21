// import type { Preview } from '@storybook/vue3-vite'
import "jonny-element/dist/index.css"

/** @type { import('@storybook/vue3').Preview } */

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;