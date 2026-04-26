import React from 'react';

const TOKENS = {
  ink: '#111114',
  paper: '#F4F1EC',
  accent: '#E25A3C',
};

function Mark({ stroke, dotFill }) {
  return (
    <>
      <g
        fill="none"
        stroke={stroke}
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M50 30 L100 70 L150 30" />
        <path d="M170 50 L130 100 L170 150" />
        <path d="M150 170 L100 130 L50 170" />
        <path d="M30 150 L70 100 L30 50" />
      </g>
      <circle cx={100} cy={100} r={11} fill={dotFill} />
    </>
  );
}

export default function GerenteLogo({
  size = 32,
  variant = 'primary',
  title = 'Gerente',
  ...rest
}) {
  if (variant === 'lockup') {
    const height = size;
    const width = size * 3.6;
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 720 200"
        role="img"
        aria-label={title}
        {...rest}
      >
        <title>{title}</title>
        <Mark stroke="currentColor" dotFill={TOKENS.accent} />
        <text
          x={240}
          y={135}
          fontFamily="'Inter Tight', 'Inter', system-ui, sans-serif"
          fontSize={120}
          fontWeight={700}
          letterSpacing={-5}
          fill="currentColor"
        >
          Gerente
        </text>
      </svg>
    );
  }

  const stroke =
    variant === 'mono'        ? 'currentColor' :
    variant === 'mono-accent' ? 'currentColor' :
    variant === 'reverse'     ? TOKENS.paper   :
                                TOKENS.ink;

  const dotFill =
    variant === 'mono' ? 'currentColor' : TOKENS.accent;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={title}
      {...rest}
    >
      <title>{title}</title>
      <Mark stroke={stroke} dotFill={dotFill} />
    </svg>
  );
}
