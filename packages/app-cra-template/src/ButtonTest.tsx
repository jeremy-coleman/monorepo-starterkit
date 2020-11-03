import Button from '@material-ui/core/Button';
import { styled } from '@material-ui/styles';
import { readableColor } from 'polished';
import React, { useState } from 'react';

function CounterButton() {
  const [count, setCount] = useState(0);
  let increment = () => setCount(count + 1)
  return (
    <div>
      <p>Counter: {count}</p>
      <button onClick={increment as any}>Increment</button>
    </div>
  );
};

type Props = {
  color: 'green' | 'black'
}

let MyButton = styled(Button as any)((props: Props) => ({
  backgroundColor: (props.color && props.color) || 'green',
  color: readableColor(props.color)
}))

let NoPropsButton = styled(Button)({
  backgroundColor: 'green',
})



export { MyButton, NoPropsButton, CounterButton };

