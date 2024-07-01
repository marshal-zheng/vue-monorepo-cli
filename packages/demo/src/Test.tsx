import Vue, { VNode } from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';
import styled from 'vue-styled-components';
import VueTypes from 'vue-types'

// Define props types for the styled button
const buttonProps = {
  primary: Boolean,
  size: String,
};

// Create a styled button component
const StyledButton = styled('button', buttonProps)`
  background-color: ${(props: any) => (props.primary ? 'blue' : 'gray')};
  color: white;
  padding: ${(props: any) => {
    switch (props.size) {
      case 'small':
        return '5px 10px';
      case 'large':
        return '15px 30px';
      default:
        return '10px 20px';
    }
  }};
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

@Component
export class Button extends Vue {
  @Prop(VueTypes.bool.def(false)) primary!: string
  @Prop(VueTypes.string.def('medium')) size!: string
  @Prop(VueTypes.string) label!: string

  @Emit('click')
  handleClick() {
  }

  render(): VNode {
    console.log('primary', this.primary)
    return (
      <StyledButton primary={this.primary} size={this.size} onClick={this.handleClick}>
        {this.label}
      </StyledButton>
    );
  }
}