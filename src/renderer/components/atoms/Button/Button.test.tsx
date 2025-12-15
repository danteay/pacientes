import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('should render button with children', () => {
    render(<Button>Click Me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply primary variant class', () => {
    render(<Button variant="primary">Primary</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('is-primary');
  });

  it('should apply secondary variant class', () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('is-secondary');
  });

  it('should apply danger variant class', () => {
    render(<Button variant="danger">Danger</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('is-danger');
  });

  it('should apply small size class', () => {
    render(<Button size="small">Small</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('is-small');
  });

  it('should apply medium size class', () => {
    render(<Button size="medium">Medium</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('is-medium');
  });

  it('should apply large size class', () => {
    render(<Button size="large">Large</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('is-large');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should apply fullwidth class when isFullWidth is true', () => {
    render(<Button isFullWidth>Full Width</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('is-fullwidth');
  });

  it('should apply loading class when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('is-loading');
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should set button type attribute', () => {
    render(<Button type="submit">Submit</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should set title attribute', () => {
    render(<Button title="Tooltip text">Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Tooltip text');
  });

  it('should combine multiple classes correctly', () => {
    render(
      <Button variant="primary" size="large" isFullWidth isLoading className="custom">
        Multiple Classes
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('button');
    expect(button).toHaveClass('is-primary');
    expect(button).toHaveClass('is-large');
    expect(button).toHaveClass('is-fullwidth');
    expect(button).toHaveClass('is-loading');
    expect(button).toHaveClass('custom');
  });
});
