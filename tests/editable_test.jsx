import React from 'react';
import {
  renderIntoDocument,
  findRenderedDOMComponentWithTag,
  findRenderedDOMComponentWithClass,
  Simulate
} from 'react-addons-test-utils';
import assert from 'assert';
import Editable from '../app/components/Editable';

describe('Editable', function() {
  it('renders value', function() {
    const value = 'value';
    const component = renderIntoDocument(
    <Editable value={value} />
    );
    const valueComponent = findRenderedDOMComponentWithClass(component, 'value');
    assert.equal(valueComponent.textContent, value);
  });

  it('triggers onValueClick', () => {
    let triggered = false;
    const value = 'value';
    const onValueClick = () => triggered = true;
    const component = renderIntoDocument(
        <Editable value={value} onValueClick={onValueClick} />
    );
    const valueComponent = findRenderedDOMComponentWithClass(component, 'value');
    Simulate.click(valueComponent);
    assert.equal(triggered, true);
  });

    it('triggers onEdit', () => {
        let triggered = false;
        const newValue = 'value';
        const onEdit = (val) => {
            triggered = true;
            assert.equal(val, newValue);
        };
        const component = renderIntoDocument(
        <Editable editing={true} value={'value'} onEdit={onEdit} />
        );
        const input = findRenderedDOMComponentWithTag(component, 'input');
        input.value = newValue;
        Simulate.blur(input);
        assert.equal(triggered, true);
    });

    it('allows deletion', () => {
        let deleted = false;
        const onDelete = () => {
            deleted = true;
        };
        const component = renderIntoDocument(
        <Editable value={'value'} onDelete={onDelete} />
        );
        let deleteComponent = findRenderedDOMComponentWithClass(component, 'delete');
        Simulate.click(deleteComponent);
        assert.equal(deleted, true);
    });

  it('triggers onEdit through the DOM', function() {
    let triggered = false;
    const newValue = 'value';
    const onEdit = (val) => {
      triggered = true;
      assert.equal(val, newValue);
    };
    const component = renderIntoDocument(
      <Wrapper>
        <Editable editing={true} value={'value'} onEdit={onEdit} />
      </Wrapper>
    );

    const input = findRenderedDOMComponentWithTag(component, 'input');
    input.value = newValue;

    Simulate.blur(input);

    assert.equal(triggered, true);
  });
});

class Wrapper extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}
