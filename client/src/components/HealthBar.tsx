import React, {useState, useRef} from 'react';

interface HealthBarProps {
    castle: "red" | "blue";
    health: number;
}

const shimmerStyle: { [key: string]: React.CSSProperties } = {
    "red": {
        left: "2%",
        top: "6.25%",
        height: "8%",
        width: "32.5%",
        pointerEvents: "all"
    },
    "blue": {
        right: "2.5%",
        top: "6.25%",
        height: "8%",
        width: "32.5%",
        pointerEvents: "all"
    }
};

const fillStyle: { [key: string]: React.CSSProperties } = {
    "red": {
        left: "1%",
        top: "4.5%",
        height: "8%",
        width: "35%",
        pointerEvents: "all"
    },
    "blue": {
        right: "1%",
        top: "4.5%",
        height: "8%",
        width: "35%",
        pointerEvents: "all"
    }
};

const mainStyle: { [key: string]: React.CSSProperties } = {
    "red": {
        left: "1%",
        top: "4.5%",
        height: "8%",
        width: "35%",
        pointerEvents: "all"
    },
    "blue": {
        right: "1%",
        top: "4.5%",
        height: "8%",
        width: "35%",
        pointerEvents: "all"
    }
};

const baseTooltipStyle: React.CSSProperties = {
    position: "absolute",
    top: "8%",
    height: "3%",
    width: "3%",
    color: 'black', 
    textAlign: 'start',
    textSizeAdjust: 'auto',
    fontSize: '1rem', 
    backgroundColor: 'white', 
    padding: '5px', 
    borderRadius: '2px', 
    boxShadow: '0px 0px 5px rgba(0,0,0,0.2)'
};

const hpTooltipStyle: { [key: string]: React.CSSProperties } = {
    "red": {
        ...baseTooltipStyle,
        left: "1%"
    },
    "blue": {
        ...baseTooltipStyle,
        right: "1%"
    }
};

const fillColor = {
    "red": "#FF0000",
    "blue": "#0500B5"
};

const extraHpColor = {
    "red": ["#830909","#B81B89"],
    "blue": ["#06045B","#EEB515"]
};

const shimmerColor = {
    "red": "#FFAFAF",
    "blue": "#9DDEFF"
};

export const HealthBar: React.FC<HealthBarProps> = ({ castle, health }) => {

    const [isHovered, setIsHovered] = useState(false);
    const healthBarDiv = useRef<HTMLDivElement>(null);

    const MAX_CASTLE_HP = health > 100 ? 5000 : 100;

    const TIER_THRESHOLDS = [5000, 10000, 15000]; // Thresholds for 100%, 200%, 300%
    
    const handleMouseEnter = (event: React.PointerEvent) => {
        setIsHovered(true);
    };
    
    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const updateHPFill = (tier: number, health: number) => {
        if (health >= TIER_THRESHOLDS[tier]) {
            return {
                ...fillStyle[castle],
                width: `35%`
            };
        } else {
            return {
                ...fillStyle[castle],
                width: `${(health - TIER_THRESHOLDS[tier - 1]) / MAX_CASTLE_HP * 35}%`
            };
        }
    };

    const updateHPShimmer = (health: number) => {
        if (health <= MAX_CASTLE_HP) {    
            return {
                ...shimmerStyle[castle],
                width: `${health / MAX_CASTLE_HP * 32.5}%`
            };
        } else {
            return {
                ...shimmerStyle[castle],
                width: `32.5%`
            };
        }
    };

    return (
        <> 
            <div ref={healthBarDiv} onPointerEnter={handleMouseEnter} onPointerLeave={handleMouseLeave} >

                {/* base health bar */}
                <svg id={`${castle}-hp-fill}`} className="svg-background" style={updateHPFill(0, health)}>
                    <rect id="fill" x="4" y="4" width="100%" height="100%" fill={fillColor[castle]} />
                </svg>

                {/* extra health bar - tier 2 */}
                {health > TIER_THRESHOLDS[0] && <svg id={`${castle}-hp-extra`} className="svg-background" style={updateHPFill(1, health)}>
                    <rect id="fill" x="4" y="4" width="100%" height="100%" fill={extraHpColor[castle][0]} />
                </svg>}

                {/* extra health bar - tier 3*/}
                {health > TIER_THRESHOLDS[1] && <svg id={`${castle}-hp-extra2`} className="svg-background" style={updateHPFill(2, health)}>
                    <rect id="fill" x="4" y="4" width="100%" height="100%" fill={extraHpColor[castle][1]} />
                </svg>}

                <svg id={`${castle}-hp}`} className="svg-background" style={mainStyle[castle]} >
                    <image xlinkHref={castle == "red" ? '/red health bar.svg' : '/blue health bar.svg'} width="100%"/>
                </svg>

                <svg id={`${castle}-hp-shimmer}`} className="svg-background" style={updateHPShimmer(health)}>
                    <rect x="5" y="5" width="100%" height="5%" fill={shimmerColor[castle]} />
                </svg>

            </div>
            {isHovered && (
                <div style={hpTooltipStyle[castle]}>
                    {(health > 100 ? (health / MAX_CASTLE_HP * 100) : health).toFixed(1)}%
                </div>
            )}
        </>
    );
};