import React, { Component } from 'react';
import BasicInput from './BasicInput';

const OInputType = {
  basic: 'BASIC',
} as const;

type InputType = typeof OInputType[keyof typeof OInputType];

export interface InputProps {
  inputType: InputType;
  onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
  activeInput?: boolean;
  placeholder?: string;
}

class Input extends Component<InputProps> {
  renderElement(props: InputProps) {
    switch (props.inputType) {
      case OInputType.basic:
        return <BasicInput {...props} />;
      default:
        console.error('Input Props 확인');
    }
  }

  render() {
    return this.renderElement(this.props);
  }
}

export default Input;
