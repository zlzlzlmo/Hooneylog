import React, { Component } from 'react';
import BasicButton from './BasicButton';

const OButtonType = {
  basic: 'BASIC',
} as const;

type ButtonType = typeof OButtonType[keyof typeof OButtonType];

export interface ButtonProps {
  buttonType: ButtonType;
  children: React.ReactNode;
  onClick?: () => void;
}

class Button extends Component<ButtonProps> {
  renderElement(props: ButtonProps) {
    switch (props.buttonType) {
      case OButtonType.basic:
        return <BasicButton {...props} />;
      default:
        console.error('Button Props 확인');
    }
  }

  render() {
    return this.renderElement(this.props);
  }
}

export default Button;
