import { cn } from "@/lib/utils";

// Side-profile vector illustrations used whenever a vehicle has no photo.
// Drawn on a 400x190 canvas, facing right. Each shape knows where its wheels,
// windows, door seams, and lights are so the details line up per body type.

type Shape = {
  wheels: [number, number];
  r: number;
  cy: number;
  arch: number;
  body: (arch: (cx: number) => string) => string;
  windows: string[];
  belt: number;
  doors: number[];
  head: [number, number];
  tail: [number, number];
  handle: [number, number];
  rails?: boolean;
  spoiler?: boolean;
  bed?: boolean;
  open?: boolean;
};

const BOTTOM = 152;

function archPath(cx: number, cy: number, r: number) {
  const h = Math.sqrt(r * r - (BOTTOM - cy) * (BOTTOM - cy));
  return `L${(cx + h).toFixed(1)} ${BOTTOM} A${r} ${r} 0 1 0 ${(cx - h).toFixed(1)} ${BOTTOM}`;
}

const SHAPES: Record<string, Shape> = {
  sedan: {
    wheels: [96, 300],
    r: 25,
    cy: 147,
    arch: 29,
    body: (a) =>
      `M30 148 C28 135 30 124 36 116 L44 104 C70 100 100 98 116 97 L150 68 C156 63 162 62 170 62 L232 62 C240 62 246 64 252 69 L286 97 C318 100 346 104 362 110 C370 114 374 122 374 132 L374 146 C374 150 371 152 366 152 ${a(300)} ${a(96)} L36 152 C32 152 30 151 30 148 Z`,
    windows: [
      "M122 96 L154 70 C158 67 162 66 168 66 L197 66 L197 96 Z",
      "M203 66 L232 66 C238 66 243 68 247 72 L274 96 L203 96 Z",
    ],
    belt: 101,
    doors: [200, 128],
    head: [358, 112],
    tail: [32, 116],
    handle: [214, 106],
  },
  suv: {
    wheels: [98, 300],
    r: 28,
    cy: 144,
    arch: 32,
    body: (a) =>
      `M26 144 L26 106 C26 98 30 92 38 90 L58 86 L96 52 C100 48 106 46 114 46 L248 46 C256 46 262 48 266 54 L292 86 C326 90 352 96 364 102 C372 106 376 114 376 124 L376 144 C376 149 373 152 368 152 ${a(300)} ${a(98)} L32 152 C28 152 26 149 26 144 Z`,
    windows: [
      "M66 86 L100 56 C103 53 107 52 112 52 L148 52 L148 86 Z",
      "M154 52 L204 52 L204 86 L154 86 Z",
      "M210 52 L244 52 C250 52 255 54 258 58 L284 86 L210 86 Z",
    ],
    belt: 92,
    doors: [207, 151],
    head: [362, 104],
    tail: [28, 98],
    handle: [222, 98],
    rails: true,
  },
  hatchback: {
    wheels: [100, 292],
    r: 25,
    cy: 147,
    arch: 29,
    body: (a) =>
      `M40 146 L40 112 C40 102 44 92 52 84 L74 64 C80 59 88 57 96 57 L214 57 C224 57 230 60 236 66 L268 96 C306 100 334 106 348 112 C356 116 360 124 360 134 L360 146 C360 150 357 152 352 152 ${a(292)} ${a(100)} L46 152 C42 152 40 150 40 146 Z`,
    windows: [
      "M58 92 L80 68 C84 64 89 62 95 62 L150 62 L150 92 Z",
      "M156 62 L212 62 C219 62 224 64 228 69 L256 92 L156 92 Z",
    ],
    belt: 98,
    doors: [153],
    head: [346, 112],
    tail: [42, 100],
    handle: [170, 104],
  },
  coupe: {
    wheels: [100, 302],
    r: 25,
    cy: 147,
    arch: 29,
    body: (a) =>
      `M26 146 C26 134 28 124 34 118 C46 108 70 102 100 98 L150 74 C160 69 170 67 182 67 L222 67 C232 67 240 70 248 76 L282 100 C318 104 348 110 364 116 C372 120 376 128 376 136 L376 146 C376 150 373 152 368 152 ${a(302)} ${a(100)} L32 152 C28 152 26 150 26 146 Z`,
    windows: [
      "M122 98 L156 79 C163 75 171 73 181 73 L222 73 C230 73 236 75 242 80 L266 98 Z",
    ],
    belt: 104,
    doors: [232],
    head: [362, 118],
    tail: [28, 120],
    handle: [214, 110],
    spoiler: true,
  },
  convertible: {
    wheels: [100, 302],
    r: 25,
    cy: 147,
    arch: 29,
    body: (a) =>
      `M26 146 C26 134 28 124 34 116 C40 108 60 104 90 103 L278 104 C316 106 348 110 364 116 C372 120 376 128 376 136 L376 146 C376 150 373 152 368 152 ${a(302)} ${a(100)} L32 152 C28 152 26 150 26 146 Z`,
    windows: ["M256 104 L232 76 C231 74 233 73 235 74 L270 104 Z"],
    belt: 110,
    doors: [236],
    head: [362, 118],
    tail: [28, 118],
    handle: [212, 114],
    open: true,
  },
  truck: {
    wheels: [92, 302],
    r: 29,
    cy: 143,
    arch: 33,
    body: (a) =>
      `M20 144 L20 96 C20 93 22 92 25 92 L170 92 L176 54 C177 50 180 48 184 48 L258 48 C264 48 268 50 271 55 L292 88 C328 91 354 96 368 102 C376 106 380 114 380 124 L380 144 C380 149 377 152 372 152 ${a(302)} ${a(92)} L26 152 C22 152 20 149 20 144 Z`,
    windows: [
      "M184 54 L221 54 L221 88 L179 88 Z",
      "M227 54 L256 54 C261 54 264 56 266 59 L284 88 L227 88 Z",
    ],
    belt: 96,
    doors: [224, 174],
    head: [366, 104],
    tail: [22, 100],
    handle: [236, 100],
    bed: true,
  },
  van: {
    wheels: [96, 300],
    r: 27,
    cy: 145,
    arch: 31,
    body: (a) =>
      `M24 146 L24 50 C24 42 30 36 38 36 L250 36 C260 36 266 40 272 48 L306 92 C334 96 356 102 366 108 C373 112 376 120 376 128 L376 146 C376 150 373 152 368 152 ${a(300)} ${a(96)} L30 152 C26 152 24 150 24 146 Z`,
    windows: [
      "M38 48 L94 48 L94 86 L38 86 Z",
      "M102 48 L168 48 L168 86 L102 86 Z",
      "M176 48 L236 48 L236 86 L176 86 Z",
      "M244 48 L254 48 C259 48 263 50 266 54 L296 86 L244 86 Z",
    ],
    belt: 94,
    doors: [240, 172],
    head: [364, 110],
    tail: [26, 96],
    handle: [252, 100],
  },
};

export function shapeKey(bodyType?: string | null) {
  const key = (bodyType ?? "").toLowerCase();
  return key in SHAPES ? key : "sedan";
}

/**
 * Single-stroke line drawing in the current text colour, so it adapts to
 * light and dark themes without any extra palette.
 */
export function CarIllustration({
  bodyType,
  className,
  title,
}: {
  bodyType?: string | null;
  className?: string;
  title?: string;
}) {
  const key = shapeKey(bodyType);
  const s = SHAPES[key];
  const clip = `car-${key}-clip`;
  const bodyPath = s.body((cx) => archPath(cx, s.cy, s.arch));
  const ground = s.cy + s.r;

  return (
    <svg
      viewBox="0 0 400 190"
      role="img"
      aria-label={title ?? `${key} illustration`}
      className={cn("h-auto w-full", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <clipPath id={clip}>
          <path d={bodyPath} />
        </clipPath>
      </defs>

      <path d={`M8 ${ground} L392 ${ground}`} strokeOpacity="0.25" />
      <path d={bodyPath} />
      {s.windows.map((w) => (
        <path key={w} d={w} strokeOpacity="0.7" />
      ))}

      <g clipPath={`url(#${clip})`} strokeOpacity="0.45" strokeWidth="1.2">
        {s.doors.map((x) => (
          <path key={x} d={`M${x} ${s.belt - 4} L${x} 146`} />
        ))}
        {s.bed && <path d="M24 104 L166 104" />}
      </g>

      <path
        d={`M${s.handle[0]} ${s.handle[1] + 1.5} L${s.handle[0] + 12} ${s.handle[1] + 1.5}`}
        strokeOpacity="0.6"
      />
      <path
        d={`M${s.head[0] - 4} ${s.head[1] + 3} L${s.head[0] + 8} ${s.head[1] + 3}`}
      />
      <path
        d={`M${s.tail[0] + 2} ${s.tail[1]} L${s.tail[0] + 2} ${s.tail[1] + 9}`}
      />

      {s.rails && <path d="M104 43 L250 43" />}
      {s.spoiler && <path d="M30 114 L50 108" />}
      {s.open && (
        <>
          <path
            d="M146 104 L146 84 C146 81 148 80 151 80 L153 80 C156 80 158 81 158 84 L158 104"
            strokeOpacity="0.6"
          />
          <path
            d="M202 104 L202 84 C202 81 204 80 207 80 L209 80 C212 80 214 81 214 84 L214 104"
            strokeOpacity="0.6"
          />
          <path d="M226 100 L238 90" strokeOpacity="0.6" />
        </>
      )}

      {s.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={s.cy} r={s.r} />
          <circle cx={cx} cy={s.cy} r={s.r * 0.42} strokeOpacity="0.6" />
        </g>
      ))}
    </svg>
  );
}
