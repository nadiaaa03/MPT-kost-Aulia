const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const icons = {
  bed: (
    <g {...stroke}>
      <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
      <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M12 4v6M2 18h20" />
    </g>
  ),
  shield: (
    <g>
      <path
        d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z"
        fill="currentColor"
      />
      <rect x="9" y="11" width="6" height="5" rx="1" fill="none" stroke="#83573b" strokeWidth="1.6" />
      <path d="M10.2 11V9.6a1.8 1.8 0 0 1 3.6 0V11" fill="none" stroke="#83573b" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  ),
  wifi: (
    <g {...stroke}>
      <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
    </g>
  ),
  pin: (
    <g {...stroke}>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </g>
  ),
  plant: (
    <g {...stroke}>
      <path d="M7 20h10M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8Z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2Z" />
    </g>
  ),
  shirt: (
    <g {...stroke}>
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z" />
    </g>
  ),
  cart: (
    <g {...stroke}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </g>
  ),
  trees: (
    <g {...stroke}>
      <circle cx="7" cy="9" r="4" />
      <path d="M7 13v9M16 22v-4M16 3l5 10H11l5-10Z" />
    </g>
  ),
  mosque: (
    <g {...stroke}>
      <path d="M6 21v-5a6 6 0 0 1 12 0v5M12 10V6M12 6l1-1.5M2 21h20M3 21V11M21 21V11" />
    </g>
  ),
  course: (
    <g {...stroke}>
      <path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0Z" />
      <path d="M22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </g>
  ),
  office: (
    <g {...stroke}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18ZM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4" />
    </g>
  ),
  phone: (
    <g {...stroke}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </g>
  ),
  instagram: (
    <g {...stroke}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37ZM17.5 6.5h.01" />
    </g>
  ),
  tiktok: (
    <g {...stroke}>
      <path d="M9 12a4 4 0 1 0 4 4V3a5 5 0 0 0 5 5" />
    </g>
  ),
  user: (
    <g>
      <circle cx="12" cy="7" r="4.5" fill="currentColor" />
      <path d="M3 21c0-4 3-7 9-7s9 3 9 7Z" fill="currentColor" />
    </g>
  ),
  login: (
    <g {...stroke}>
      <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" />
    </g>
  ),
  arrow: (
    <g {...stroke} strokeWidth={2.2}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </g>
  ),
};

export default function Icon({ name, size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
    >
      {icons[name]}
    </svg>
  );
}