import * as React from 'react';
import { styled } from '@uifabric/styleguide';
import { CheckboxBase } from './Checkbox.base';
import { getCheckboxStyles } from './Checkbox.styles';
import { ICheckboxProps, ICheckboxStyleProps, ICheckboxStyles } from './Checkbox.types';


export const Checkbox: React.FC<ICheckboxProps> = styled<ICheckboxProps, ICheckboxStyleProps, ICheckboxStyles>(
  CheckboxBase,
  getCheckboxStyles,
  undefined,
  { scope: 'Checkbox' }
);
