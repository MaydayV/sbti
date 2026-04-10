import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { QuizApp } from './quiz-app';

afterEach(() => {
  cleanup();
});

describe('QuizApp', () => {
  it('renders intro screen title, subtitle and start button', () => {
    render(React.createElement(QuizApp));
    expect(screen.getByText('SBTI 人格测试')).toBeInTheDocument();
    expect(screen.getByText('MBTI 已经过时，SBTI 来了。')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '开始测试' })[0]).toBeInTheDocument();
  });

  it('keeps intro card vertically centered without stretching and renders satirical copy below the card', () => {
    render(React.createElement(QuizApp));
    expect(screen.queryByText('原作者：')).not.toBeInTheDocument();
    expect(screen.queryByText('托管：Cloudflare (免费)')).not.toBeInTheDocument();
    expect(screen.queryByText('域名：Spaceship (自费)')).not.toBeInTheDocument();

    const tagline = screen.getByText(/凌晨三点清醒学家/);
    expect(screen.getByText(/SBTI 人格类型/)).toBeInTheDocument();

    const introCard = document.querySelector('#intro .intro-card');
    expect(introCard).toBeTruthy();
    expect(introCard?.classList.contains('hero-center-full')).toBe(false);
    expect(introCard?.contains(tagline)).toBe(false);

    const introStack = document.querySelector('#intro .intro-stack');
    expect(introStack).toBeTruthy();
  });

  it('auto advances to next question after selecting an option', () => {
    render(React.createElement(QuizApp));
    fireEvent.click(screen.getAllByRole('button', { name: '开始测试' })[0]);

    const before = screen.getByText(/第 1 题/).textContent;
    const firstRadio = screen.getAllByRole('radio')[0];
    fireEvent.click(firstRadio);

    expect(screen.getByText(/第 2 题/)).toBeInTheDocument();
    const after = screen.getByText(/第 2 题/).textContent;
    expect(after).not.toBe(before);
  });

  it('does not render author words section in result screen', () => {
    render(React.createElement(QuizApp));
    fireEvent.click(screen.getAllByRole('button', { name: '开始测试' })[0]);

    while (screen.queryByRole('button', { name: '提交并查看结果' })?.hasAttribute('disabled')) {
      const firstRadio = screen.getAllByRole('radio')[0];
      fireEvent.click(firstRadio);
    }

    fireEvent.click(screen.getByRole('button', { name: '提交并查看结果' }));
    expect(screen.queryByText('作者的话')).not.toBeInTheDocument();
  });
});
