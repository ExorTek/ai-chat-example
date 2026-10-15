const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
};

const Icon = ({ className = 'size-5', children, ...rest }) => (
  <svg
    {...base}
    {...rest}
    className={className}
    aria-hidden='true'>
    {children}
  </svg>
);

export const SendIcon = props => (
  <Icon {...props}>
    <path d='M4 12 20 4l-8 16-2-6-6-2Z' />
  </Icon>
);

export const StopIcon = props => (
  <Icon {...props}>
    <rect
      x='6'
      y='6'
      width='12'
      height='12'
      rx='2'
      fill='currentColor'
      stroke='none'
    />
  </Icon>
);

export const PlusIcon = props => (
  <Icon {...props}>
    <path d='M12 5v14M5 12h14' />
  </Icon>
);

export const TrashIcon = props => (
  <Icon {...props}>
    <path d='M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13' />
  </Icon>
);

export const CopyIcon = props => (
  <Icon {...props}>
    <rect
      x='9'
      y='9'
      width='11'
      height='11'
      rx='2'
    />
    <path d='M5 15V5a2 2 0 0 1 2-2h8' />
  </Icon>
);

export const CheckIcon = props => (
  <Icon {...props}>
    <path d='m5 13 4 4L19 7' />
  </Icon>
);

export const RefreshIcon = props => (
  <Icon {...props}>
    <path d='M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6' />
  </Icon>
);

export const SunIcon = props => (
  <Icon {...props}>
    <circle
      cx='12'
      cy='12'
      r='4'
    />
    <path d='M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4' />
  </Icon>
);

export const MoonIcon = props => (
  <Icon {...props}>
    <path d='M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z' />
  </Icon>
);

export const SettingsIcon = props => (
  <Icon {...props}>
    <circle
      cx='12'
      cy='12'
      r='3'
    />
    <path d='M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z' />
  </Icon>
);

export const MenuIcon = props => (
  <Icon {...props}>
    <path d='M4 7h16M4 12h16M4 17h16' />
  </Icon>
);

export const CloseIcon = props => (
  <Icon {...props}>
    <path d='M6 6l12 12M18 6 6 18' />
  </Icon>
);

export const ChatIcon = props => (
  <Icon {...props}>
    <path d='M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3Z' />
  </Icon>
);

export const ArrowDownIcon = props => (
  <Icon {...props}>
    <path d='M12 5v14M6 13l6 6 6-6' />
  </Icon>
);

export const WarningIcon = props => (
  <Icon {...props}>
    <path d='M12 4 2.5 20h19L12 4Z' />
    <path d='M12 10v4M12 17h.01' />
  </Icon>
);
