import React from 'react';

interface StorefrontProps {
  size?: 'large' | 'small' | 'calendar';
  className?: string;
  showBadge?: boolean;
}

export const SoulTalkStorefront: React.FC<StorefrontProps> = ({
  size = 'large',
  className = '',
  showBadge = true,
}) => {
  const isLarge = size === 'large';
  const isSmall = size === 'small';
  const isCalendar = size === 'calendar';

  const viewBox = isSmall ? '0 0 360 280' : isCalendar ? '0 0 420 320' : '0 0 540 380';
  const width = isSmall ? 'w-full max-w-[280px]' : isCalendar ? 'w-full max-w-[360px]' : 'w-full max-w-[480px]';

  return (
    <div className={`relative flex flex-col items-center ${width} ${className}`} aria-label="SoulTalk Pastry Boutique Storefront Illustration">
      <svg
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-md select-none overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F947C" />
            <stop offset="100%" stopColor="#376E5D" />
          </linearGradient>
          <linearGradient id="wallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF9" />
            <stop offset="100%" stopColor="#FDF3EC" />
          </linearGradient>
          <linearGradient id="windowGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF8EF" />
            <stop offset="100%" stopColor="#EFD49B" stopOpacity="0.4" />
          </linearGradient>
          <pattern id="stripedAwning" width="24" height="20" patternUnits="userSpaceOnUse">
            <rect width="12" height="20" fill="#4F947C" />
            <rect x="12" width="12" height="20" fill="#FFF8EF" />
          </pattern>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Floating Petals in background */}
        <g className="animate-petal-float">
          <ellipse cx="60" cy="50" rx="4.5" ry="7" fill="#F5CDD2" transform="rotate(25 60 50)" opacity="0.85" />
          <ellipse cx="480" cy="80" rx="3.5" ry="6" fill="#D7848F" transform="rotate(-30 480 80)" opacity="0.75" />
          <ellipse cx="440" cy="40" rx="4" ry="6" fill="#F5CDD2" transform="rotate(40 440 40)" opacity="0.8" />
        </g>
        <g className="animate-petal-float" style={{ animationDelay: '-3s' }}>
          <ellipse cx="120" cy="35" rx="3" ry="5.5" fill="#EFD49B" transform="rotate(15 120 35)" opacity="0.8" />
          <ellipse cx="380" cy="65" rx="3.5" ry="6" fill="#F5CDD2" transform="rotate(-20 380 65)" opacity="0.85" />
        </g>

        {/* Small birds / sparkles */}
        <g className="animate-soft-sparkle">
          <path d="M70,30 Q75,25 80,30 Q85,25 90,30" stroke="#806D64" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.6" />
          <circle cx="495" cy="45" r="2.5" fill="#EFD49B" filter="url(#softGlow)" />
          <polygon points="460,70 462,75 467,76 463,80 464,85 460,82 456,85 457,80 453,76 458,75" fill="#EFD49B" opacity="0.9" />
        </g>

        {/* Bakery Roof Chimney with Curling Steam */}
        <g>
          <rect x="380" y="30" width="26" height="42" rx="3" fill="#D7848F" stroke="#4A362F" strokeWidth="1.8" />
          <rect x="376" y="26" width="34" height="6" rx="2" fill="#376E5D" stroke="#4A362F" strokeWidth="1.5" />
          {/* Animated Steam Clouds */}
          <g className="animate-curling-steam">
            <ellipse cx="393" cy="18" rx="6" ry="4" fill="#FFFDF9" opacity="0.7" />
            <ellipse cx="396" cy="10" rx="8" ry="5" fill="#FFFDF9" opacity="0.5" />
            <ellipse cx="392" cy="2" rx="9" ry="6" fill="#FFFDF9" opacity="0.3" />
          </g>
        </g>

        {/* Ground Stone Pavement */}
        <rect x="20" y="340" width="500" height="14" rx="7" fill="#E8D8CF" opacity="0.8" />
        <ellipse cx="270" cy="350" rx="220" ry="8" fill="#4A362F" opacity="0.08" />

        {/* Main Building Base / Walls */}
        <rect x="80" y="110" width="380" height="230" rx="16" fill="url(#wallGrad)" stroke="#E8D8CF" strokeWidth="2.5" />

        {/* Blush Lower Trim */}
        <rect x="80" y="295" width="380" height="45" rx="8" fill="#F5CDD2" stroke="#E8D8CF" strokeWidth="1.5" />
        <line x1="80" y1="295" x2="460" y2="295" stroke="#D7848F" strokeWidth="2" />

        {/* Storefront Fascia / Signboard */}
        <rect x="70" y="80" width="400" height="42" rx="12" fill="#4F947C" stroke="#376E5D" strokeWidth="2" />
        <rect x="76" y="86" width="388" height="30" rx="8" fill="#376E5D" opacity="0.3" />

        {/* Chinese & English Signage */}
        <text x="270" y="103" textAnchor="middle" fill="#FFFDF9" fontFamily="'Fraunces', serif" fontSize="16" fontWeight="600" letterSpacing="0.08em">
          SoulTalk Pastry
        </text>
        <text x="270" y="118" textAnchor="middle" fill="#EFD49B" fontFamily="'Caveat', cursive" fontSize="13" fontWeight="600">
          心聊甜香 • Kuchai Lama
        </text>

        {/* Roof Structure */}
        <path d="M50 82 L270 20 L490 82 Z" fill="url(#roofGrad)" stroke="#376E5D" strokeWidth="2.5" />
        <path d="M270 20 L270 80" stroke="#376E5D" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        <circle cx="270" cy="20" r="7" fill="#EFD49B" stroke="#4A362F" strokeWidth="1.5" />

        {/* Scalloped Roof Ridge */}
        <path
          d="M50,82 Q65,74 80,82 Q95,74 110,82 Q125,74 140,82 Q155,74 170,82 Q185,74 200,82 Q215,74 230,82 Q245,74 260,82 Q275,74 290,82 Q305,74 320,82 Q335,74 350,82 Q365,74 380,82 Q395,74 410,82 Q425,74 440,82 Q455,74 470,82 Q485,74 490,82"
          stroke="#EFD49B"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Striped Awning Over Display Windows */}
        <g>
          <path d="M64 122 L476 122 L468 152 L72 152 Z" fill="url(#stripedAwning)" stroke="#4A362F" strokeWidth="1.5" />
          {/* Awning Scallops */}
          <path
            d="M72,152 Q82,162 92,152 Q102,162 112,152 Q122,162 132,152 Q142,162 152,152 Q162,162 172,152 Q182,162 192,152 Q202,162 212,152 Q222,162 232,152 Q242,162 252,152 Q262,162 272,152 Q282,162 292,152 Q302,162 312,152 Q322,162 332,152 Q342,162 352,152 Q362,162 372,152 Q382,162 392,152 Q402,162 412,152 Q422,162 432,152 Q442,162 452,152 Q462,162 468,152"
            fill="#FFFDF9"
            stroke="#4A362F"
            strokeWidth="1.2"
          />
        </g>

        {/* Left Boutique Window with Cakes */}
        <g>
          <rect x="105" y="170" width="105" height="115" rx="10" fill="url(#windowGlow)" stroke="#4A362F" strokeWidth="2" />
          <line x1="157" y1="170" x2="157" y2="285" stroke="#E8D8CF" strokeWidth="1.8" />
          <line x1="105" y1="225" x2="210" y2="225" stroke="#E8D8CF" strokeWidth="1.8" />
          {/* Cake display stands inside */}
          <ellipse cx="132" cy="255" rx="16" ry="4" fill="#FFFDF9" stroke="#E8D8CF" strokeWidth="1" />
          <rect x="122" y="240" width="20" height="14" rx="3" fill="#D7848F" />
          <circle cx="132" cy="238" r="3" fill="#D45D67" />

          <ellipse cx="182" cy="255" rx="16" ry="4" fill="#FFFDF9" stroke="#E8D8CF" strokeWidth="1" />
          <rect x="174" y="243" width="16" height="11" rx="2" fill="#4F947C" />
          <circle cx="182" cy="241" r="2.5" fill="#EFD49B" />
        </g>

        {/* Center Entrance Door */}
        <g className="group/door cursor-pointer">
          <rect x="230" y="165" width="80" height="130" rx="8" fill="#FFFDF9" stroke="#4A362F" strokeWidth="2.2" />
          
          {/* Hanging Brass Shop Bell */}
          <g className="animate-bell-jiggle" style={{ transformOrigin: '270px 158px' }}>
            <line x1="270" y1="154" x2="270" y2="162" stroke="#4A362F" strokeWidth="1.5" />
            <path d="M265 165 C265 162 275 162 275 165 L276 167 L264 167 Z" fill="#EFD49B" stroke="#4A362F" strokeWidth="1" />
            <circle cx="270" cy="168" r="1.5" fill="#C89445" />
          </g>

          {/* Door Top Glass Arch */}
          <path d="M240 195 A20 20 0 0 1 300 195 Z" fill="#DCEBE2" stroke="#4A362F" strokeWidth="1.5" />
          {/* Door Paneling */}
          <rect x="240" y="210" width="60" height="38" rx="4" fill="#FFF8EF" stroke="#E8D8CF" strokeWidth="1.5" />
          <rect x="240" y="255" width="60" height="34" rx="4" fill="#FDF3EC" stroke="#E8D8CF" strokeWidth="1.5" />
          {/* Gold Door Handle */}
          <circle cx="290" cy="235" r="4" fill="#EFD49B" stroke="#4A362F" strokeWidth="1" />
          <line x1="290" y1="239" x2="290" y2="252" stroke="#EFD49B" strokeWidth="2.5" strokeLinecap="round" />
          {/* "Welcome" Door Mat */}
          <rect x="232" y="293" width="76" height="6" rx="2" fill="#5B3D33" />
        </g>

        {/* Right Boutique Window with Pastry Display */}
        <g>
          <rect x="330" y="170" width="105" height="115" rx="10" fill="url(#windowGlow)" stroke="#4A362F" strokeWidth="2" />
          <line x1="382" y1="170" x2="382" y2="285" stroke="#E8D8CF" strokeWidth="1.8" />
          <line x1="330" y1="225" x2="435" y2="225" stroke="#E8D8CF" strokeWidth="1.8" />
          {/* Glass Cake Cloche */}
          <ellipse cx="358" cy="255" rx="16" ry="4" fill="#FFFDF9" stroke="#E8D8CF" strokeWidth="1" />
          <path d="M346 254 C346 242 370 242 370 254 Z" fill="#DCEBE2" opacity="0.6" stroke="#4F947C" strokeWidth="1" />
          <circle cx="358" cy="242" r="2.5" fill="#EFD49B" />

          {/* Verrine cup */}
          <ellipse cx="406" cy="255" rx="14" ry="3.5" fill="#FFFDF9" stroke="#E8D8CF" strokeWidth="1" />
          <rect x="399" y="240" width="14" height="14" rx="2" fill="#D45D67" opacity="0.8" />
        </g>

        {/* Warm Lanterns beside door */}
        <g filter="url(#softGlow)">
          <rect x="216" y="195" width="8" height="14" rx="2" fill="#EFD49B" stroke="#4A362F" strokeWidth="1" />
          <rect x="316" y="195" width="8" height="14" rx="2" fill="#EFD49B" stroke="#4A362F" strokeWidth="1" />
        </g>

        {/* Left Planter & Drifting Tree */}
        <g className="animate-tree-drift" style={{ transformOrigin: '55px 340px' }}>
          {/* Pot */}
          <polygon points="42,340 68,340 65,310 45,310" fill="#FFFDF9" stroke="#E8D8CF" strokeWidth="1.5" />
          <rect x="43" y="306" width="24" height="5" rx="2" fill="#D7848F" />
          {/* Tree Foliage */}
          <circle cx="55" cy="275" r="24" fill="#4F947C" stroke="#376E5D" strokeWidth="1.5" />
          <circle cx="45" cy="265" r="16" fill="#376E5D" opacity="0.4" />
          <circle cx="65" cy="270" r="14" fill="#DCEBE2" opacity="0.3" />
          <circle cx="58" cy="250" r="3" fill="#F5CDD2" />
          <circle cx="46" cy="285" r="2.5" fill="#EFD49B" />
        </g>

        {/* Right Planter & Drifting Tree */}
        <g className="animate-tree-drift" style={{ transformOrigin: '485px 340px', animationDelay: '-2.5s' }}>
          {/* Pot */}
          <polygon points="472,340 498,340 495,310 475,310" fill="#FFFDF9" stroke="#E8D8CF" strokeWidth="1.5" />
          <rect x="473" y="306" width="24" height="5" rx="2" fill="#4F947C" />
          {/* Tree Foliage */}
          <circle cx="485" cy="275" r="24" fill="#4F947C" stroke="#376E5D" strokeWidth="1.5" />
          <circle cx="495" cy="265" r="16" fill="#376E5D" opacity="0.4" />
          <circle cx="475" cy="270" r="14" fill="#DCEBE2" opacity="0.3" />
          <circle cx="480" cy="252" r="3" fill="#F5CDD2" />
        </g>
      </svg>

      {showBadge && (
        <div className="mt-2 text-center">
          <span className="font-script text-lg text-[var(--color-primary-dark)] font-semibold tracking-wide block">
            {isSmall ? 'Handcrafted Daily • Kuchai Lama' : 'Welcome to our Kuchai Lama Boutique Bakery'}
          </span>
        </div>
      )}
    </div>
  );
};

