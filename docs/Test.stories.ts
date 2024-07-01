import { Meta, Story } from '@storybook/vue';
import { Button } from '../packages/demo/src';

export default {
  title: 'Case/Button Demo',
  component: Button,
  argTypes: {
    primary: { control: 'boolean' },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    label: { control: 'text' },
    onClick: { action: 'clicked' },
  },
  parameters: {
    docs: {
      description: {
        component: 'Button component for user interaction with primary and secondary styles.',
      },
    },
  },
  tags: ['autodocs']
} as Meta;

const Template: Story = (args, { argTypes }) => ({
  components: { Button },
  props: Object.keys(argTypes),
  template: '<Button v-bind="$props" @click="onClick">{{ label }}</Button>',
});

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
  label: 'Primary Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  primary: false,
  label: 'Secondary Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Large Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Small Button',
};
