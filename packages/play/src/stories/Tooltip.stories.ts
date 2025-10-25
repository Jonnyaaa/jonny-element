import type { StoryObj, Meta } from "@storybook/vue3";

import { fn } from "@storybook/test";
import { JoTooltip } from "jonny-element";
import 'jonny-element/dist/theme/Tooltip.css'

type Story = StoryObj<typeof JoTooltip>;

const meta: Meta<typeof JoTooltip> = {
  title: "Example/Tooltip",
  component: JoTooltip,
  tags: ["autodocs"],
  argTypes: {
    trigger: {
      options: ["hover", "click", "contextmenu"],
      control: {
        type: "select",
      },
    },
    placement: {
      options: ["top", "bottom", "left", "right"],
      control: {
        type: "select",
      },
    },
  },
  args: {
    "onVisible-change": fn(),
  },
};

export const Default: Story = {
  args: {
    content: "This is a tooltip",
    placement: "top",
    trigger: "hover",
  },
  render: (args) => ({
    components: { JoTooltip },
    setup() {
      return {
        args,
      };
    },
    template: `
      <JoTooltip v-bind="args">
          <div style="height:30px;width:200px;background:red;padding:auto">trigger</div>
      </JoTooltip>
    `,
  }),
};

export default meta;