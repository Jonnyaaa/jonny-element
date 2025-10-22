import type { Meta, StoryObj } from "@storybook/vue3";
import { JoCollapse, JoCollapseItem } from "jonny-element";
import 'jonny-element/dist/theme/Collapse.css'


type Story = StoryObj<typeof JoCollapse>;

const meta: Meta<typeof JoCollapse> = {
  title: "Components/Collapse",
  component: JoCollapse,
  subcomponents: { JoCollapseItem },
  tags: ["autodocs"],
};

export const Default: Story = {
  render: (args) => ({
    components: {
      JoCollapse,
      JoCollapseItem,
    },
    setup() {
      return {
        args,
      };
    },
    template: `
    <jo-collapse v-bind="args">
      <jo-collapse-item name="a" title="Title a">
        <div>this is content a</div>
      </jo-collapse-item>
      <jo-collapse-item name="b" title="title b">
        <div>this is content b</div>
      </jo-collapse-item>
      <jo-collapse-item name="c" title="title c  disable" disabled>
        <div>this is content c</div>
      </jo-collapse-item>
    </jo-collapse>
    `,
  }),
  args: {
    accordion: true,
    modelValue: ["a"],
  },
};

export default meta;