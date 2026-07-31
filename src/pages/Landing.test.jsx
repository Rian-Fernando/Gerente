import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from './Landing';
import { FAQ, FEATURES } from '../constants/siteInfo';

// jsdom has no WebGL, so the three.js scene takes its "renderer failed" path.
// That is exactly the fallback real visitors get with WebGL blocked, so this
// suite doubles as a check that the page is complete without the 3D scene.

const renderLanding = () =>
  render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );

describe('Landing', () => {
  test('renders exactly one h1', () => {
    renderLanding();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  test('the h1 says what the product is', () => {
    renderLanding();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/task manager/i);
  });

  test('has a nav, a main and a footer', () => {
    const { container } = renderLanding();
    expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument();
    expect(container.querySelector('main')).toBeInTheDocument();
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  test('every FAQ question is rendered as visible copy, matching the JSON-LD', () => {
    renderLanding();
    FAQ.forEach(({ q, a }) => {
      expect(screen.getByRole('heading', { level: 3, name: q })).toBeInTheDocument();
      expect(screen.getByText(a)).toBeInTheDocument();
    });
  });

  test('every feature is rendered', () => {
    renderLanding();
    FEATURES.forEach(({ title }) => {
      expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
    });
  });

  test('links to the task board and back to the portfolio', () => {
    renderLanding();
    expect(screen.getAllByRole('link', { name: /open gerente/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /rian fernando/i })).toHaveAttribute(
      'href',
      'https://rianfernando.com'
    );
  });

  test('sets the document title and canonical for the home route', () => {
    renderLanding();
    expect(document.title).toMatch(/^Gerente — /);
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://gerente.rianfernando.com/'
    );
  });
});
