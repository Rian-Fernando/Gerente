import React from 'react';

const TOKENS = {
  ink: '#111114',
  paper: '#F4F1EC',
  accent: '#E25A3C',
};

function Mark({ fill, accentFill }) {
  return (
    <>
      <path d="M40 40 H110 V60 H60 V150 H40 Z" fill={fill} />
      <path d="M160 160 H90 V140 H140 V50 H160 Z" fill={fill} />
      <rect x={92} y={92} width={16} height={16} fill={accentFill} />
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
        <Mark fill="currentColor" accentFill={TOKENS.accent} />
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

  const fill =
    variant === 'mono'        ? 'currentColor' :
    variant === 'mono-accent' ? 'currentColor' :
    variant === 'reverse'     ? TOKENS.paper   :
                                TOKENS.ink;

  const accentFill =
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
      <Mark fill={fill} accentFill={accentFill} />
    </svg>
  );
}
