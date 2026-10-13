import React, {useId} from 'react';

export type TravelerProps = {
  /** Scene time in seconds. All motion is deterministic. */
  t: number;
  x?: number;
  y?: number;
  scale?: number;
  facing?: 1 | -1;
  walking?: boolean;
  cold?: boolean;
  warm?: number;
  back?: boolean;
};

/** A layered, hand-drawn Song-period traveler, anchored by the soles of his shoes. */
export const Traveler: React.FC<TravelerProps> = ({
  t,
  x = 1360,
  y = 920,
  scale = 0.65,
  facing = 1,
  walking = true,
  cold = false,
  warm = 0,
  back = false,
}) => {
  const uid = `traveler${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const phase = (t - 0.42) * Math.PI * 109.18 / 60;
  const gait = walking ? Math.sin(phase) : 0;
  const bob = walking ? -3.2 * Math.abs(Math.cos(phase)) : Math.sin(t * 1.5) * 0.7;
  const wind = Math.sin(t * 2.15) * 5 + Math.sin(t * 4.2) * 1.5;
  const shiver = cold ? Math.sin(t * 12) * 0.7 : 0;
  const gold = Math.min(1, Math.max(0, warm));
  const caneAngle = walking ? Math.sin(phase + 0.7) * 3.3 : -1.5;
  const torsoLean = cold ? 1.6 : gait * 0.55;
  const hatAngle = -5.5 + gait * 0.6 + Math.sin(t * 1.8) * 0.3;

  const legs = [0, 1].map((index) => {
    const p = phase + index * Math.PI;
    const stride = walking ? Math.sin(p) * 35 : index === 0 ? -14 : 17;
    const lift = walking ? Math.pow(Math.max(0, Math.cos(p)), 1.8) * 19 : 0;
    const hipX = index === 0 ? 240 : 285;
    const kneeX = hipX + stride * 0.53;
    const ankleX = hipX + stride;
    const ankleY = 752 - lift;
    return {index, hipX, kneeX, ankleX, ankleY, lift};
  });

  // Fixed arithmetic, not random sampling, keeps the brush fibers stable on every frame.
  const fibers = Array.from({length: 86}, (_, i) => {
    const f = i / 85;
    const shoulderX = 167 + f * 172;
    const shoulderY = 247 + Math.sin(f * Math.PI) * -28 + Math.pow(f, 2) * 19;
    const leftness = 1 - f;
    const endX = 129 + f * 248 + wind * leftness * 0.64;
    const endY = 465 + Math.sin(f * Math.PI) * 95 + ((i * 37) % 31) - 15;
    const middleX = shoulderX * 0.45 + endX * 0.55 + Math.sin(i * 2.6) * 4;
    return {
      path: `M ${shoulderX} ${shoulderY} Q ${middleX - 11} ${shoulderY + 116} ${endX} ${endY}`,
      color: ['#a69a73', '#655f49', '#b8a580', '#474b3a', '#8a8260'][i % 5],
      width: i % 7 === 0 ? 2.15 : 0.8 + (i % 3) * 0.3,
    };
  });

  return (
    <svg
      viewBox="0 0 500 800"
      width={500 * scale}
      height={800 * scale}
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: x - 250 * scale,
        top: y - 780 * scale,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <linearGradient id={id('robe')} x1="0" y1="0" x2="1" y2="0.25">
          <stop offset="0" stopColor="#263d3c" />
          <stop offset="0.32" stopColor="#526764" />
          <stop offset="0.64" stopColor="#354c49" />
          <stop offset="1" stopColor="#1d3434" />
        </linearGradient>
        <linearGradient id={id('sleeve')} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#6b7b6e" />
          <stop offset="0.47" stopColor="#42594f" />
          <stop offset="1" stopColor="#283d38" />
        </linearGradient>
        <linearGradient id={id('cape')} x1="0.1" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#929273" />
          <stop offset="0.23" stopColor="#72755a" />
          <stop offset="0.64" stopColor="#555e49" />
          <stop offset="1" stopColor="#343f32" />
        </linearGradient>
        <linearGradient id={id('hat')} x1="0.2" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#b7ae84" />
          <stop offset="0.46" stopColor="#8f8966" />
          <stop offset="1" stopColor="#5f6550" />
        </linearGradient>
        <linearGradient id={id('hatUnder')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6c6a4f" />
          <stop offset="1" stopColor="#24332c" />
        </linearGradient>
        <linearGradient id={id('skin')} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#6f7762" />
          <stop offset="0.7" stopColor="#b1a788" />
          <stop offset="1" stopColor="#c9b795" />
        </linearGradient>
        <linearGradient id={id('bamboo')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#40432c" />
          <stop offset="0.4" stopColor="#959365" />
          <stop offset="0.58" stopColor="#b5aa79" />
          <stop offset="1" stopColor="#4e5338" />
        </linearGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffdf9c" stopOpacity="0.1" />
          <stop offset="0.5" stopColor="#ffe3a6" stopOpacity="0.95" />
          <stop offset="1" stopColor="#d4ad65" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id('capeClip')}>
          <path d={`M 174 247 Q 200 225 236 228 Q 305 219 339 265 Q 350 298 347 346 L 374 ${461 + wind * 0.2} L 382 507 L 357 496 L 368 525 L 340 509 L 340 541 L 318 526 L 311 552 L 292 535 L 278 563 L 260 543 L 238 564 L 228 542 L 198 555 L 199 531 L 170 540 L 177 515 L 145 524 L 153 495 L ${126 + wind} 503 Q 141 404 153 326 Q 158 279 174 247 Z`} />
        </clipPath>
      </defs>

      <g transform={facing === -1 ? 'translate(500 0) scale(-1 1)' : undefined}>
        {/* The rear leg is painted first, under the near leg and the hanging robe. */}
        {legs.map(({index, hipX, kneeX, ankleX, ankleY}) => (
          <g key={`leg-${index}`}>
            <path
              d={`M ${hipX - 19} 533 Q ${kneeX - 22} 620 ${kneeX - 11} 664 Q ${ankleX - 6} 714 ${ankleX - 9} ${ankleY} L ${ankleX + 14} ${ankleY + 2} Q ${ankleX + 14} 711 ${kneeX + 16} 661 Q ${kneeX + 25} 609 ${hipX + 19} 540 Z`}
              fill={index === 0 ? '#223a37' : '#3c5147'}
              stroke="#263b34"
              strokeWidth="2"
            />
            <path d={`M ${kneeX - 10} 653 Q ${kneeX + 8} 673 ${kneeX + 11} 706 M ${ankleX - 6} ${ankleY - 46} L ${ankleX + 14} ${ankleY - 43} M ${ankleX - 6} ${ankleY - 38} L ${ankleX + 13} ${ankleY - 35}`}
              fill="none" stroke="#82917a" strokeOpacity="0.38" strokeWidth="2" />
            {/* Soft ankle wraps and hand-woven straw sandals. */}
            <path d={`M ${ankleX - 10} ${ankleY - 14} Q ${ankleX + 1} ${ankleY - 9} ${ankleX + 15} ${ankleY - 11} L ${ankleX + 17} ${ankleY + 12} L ${ankleX - 8} ${ankleY + 13} Z`}
              fill={index === 0 ? '#858771' : '#afa88a'} />
            <path d={`M ${ankleX - 14} ${ankleY + 6} Q ${ankleX - 7} ${ankleY + 1} ${ankleX + 8} ${ankleY + 5} C ${ankleX + 21} ${ankleY + 6} ${ankleX + 32} ${ankleY + 15} ${ankleX + 48} ${ankleY + 16} Q ${ankleX + 55} ${ankleY + 19} ${ankleX + 50} ${ankleY + 25} Q ${ankleX + 14} ${ankleY + 30} ${ankleX - 15} ${ankleY + 22} Z`}
              fill={index === 0 ? '#696c50' : '#8d8961'} stroke="#303b2f" strokeWidth="2" />
            <path d={`M ${ankleX - 10} ${ankleY + 10} Q ${ankleX + 5} ${ankleY + 21} ${ankleX + 48} ${ankleY + 21} M ${ankleX + 4} ${ankleY + 5} L ${ankleX + 20} ${ankleY + 24} M ${ankleX + 11} ${ankleY + 7} L ${ankleX + 28} ${ankleY + 23}`}
              fill="none" stroke="#c0ae7c" strokeOpacity="0.65" strokeWidth="2.5" />
            {Array.from({length: 9}, (_, n) => <path key={n} d={`M ${ankleX - 10 + n * 6} ${ankleY + 21} l 2 5`} stroke="#b7a776" strokeOpacity="0.62" strokeWidth="1" />)}
          </g>
        ))}

        <g transform={`translate(${shiver} ${bob}) rotate(${torsoLean} 250 620)`}>
          {/* Long under-robe: asymmetrical folds catch a little wet, blue-green light. */}
          <path
            d={`M 188 364 C 179 429 181 511 176 554 Q 169 618 ${147 + wind} 680 Q 178 699 196 693 Q 218 709 249 699 Q 277 709 303 690 Q 329 694 344 678 Q 320 621 321 553 Q 339 478 326 365 Z`}
            fill={url('robe')}
            stroke="#263b36"
            strokeWidth="2.8"
          />
          <path d={`M 218 453 Q 199 574 ${174 + wind * 0.5} 685 M 239 466 Q 241 573 226 696 M 268 459 Q 271 582 277 697 M 298 465 Q 299 569 325 682`}
            fill="none" stroke="#95a391" strokeOpacity="0.31" strokeWidth="3" />
          <path d="M 230 501 Q 217 615 209 695 M 282 516 Q 292 602 303 687 M 184 584 Q 182 640 171 682"
            fill="none" stroke="#183330" strokeOpacity="0.63" strokeWidth="5" />
          <path d={`M ${151 + wind} 679 Q 177 694 196 688 Q 223 703 249 694 Q 277 704 301 685 Q 327 690 340 677`}
            fill="none" stroke="#a3ab92" strokeOpacity="0.29" strokeWidth="1.5" />
          <path d="M 186 413 Q 251 430 324 409 L 325 428 Q 251 447 182 432 Z" fill="#283b30" />
          <path d="M 206 430 Q 192 469 212 504 M 216 431 Q 236 465 219 484" fill="none" stroke="#9f9470" strokeWidth="4" />

          {/* A narrow head, mostly sheltered behind the brim, keeps the portrait understated. */}
          <path d="M 248 164 Q 278 150 301 174 Q 315 190 310 207 L 320 216 Q 324 223 312 226 L 309 242 Q 302 253 283 252 L 279 275 L 242 261 L 251 224 Q 232 207 235 185 Z"
            fill={url('skin')} stroke="#394239" strokeWidth="2" />
          <path d="M 234 173 Q 246 153 274 157 Q 299 158 307 179 Q 287 178 284 202 Q 281 219 266 223 L 264 246 L 239 240 Q 247 217 234 204 Q 226 188 234 173 Z"
            fill="#25352e" />
          <path d="M 251 223 Q 250 249 232 266 Q 252 270 264 250 L 268 223 Z" fill="#26372e" />
          {!back && <>
            <path d="M 302 205 l 6 1 M 310 232 q -7 2 -11 -1" stroke="#454b3d" strokeWidth="1.7" fill="none" />
            <path d="M 306 234 Q 306 257 292 266 L 293 245" fill="#374238" />
          </>}
          <path d="M 238 247 L 279 258 L 287 279 L 250 284 L 223 261 Z" fill="#b1b196" />
          <path d="M 240 255 L 271 274 L 273 294 L 224 268" fill="#687867" />

          {/* The staff has a real taper, bamboo nodes, and a restrained reflected edge. */}
          <g transform={`rotate(${caneAngle} 378 407)`}>
            <path d="M 380 338 Q 378 323 373 317 Q 369 312 369 320 L 365 358 L 392 777 Q 395 782 400 777 L 383 359 Z"
              fill={url('bamboo')} stroke="#34422d" strokeWidth="1.3" />
            {[365, 424, 488, 551, 619, 685, 748].map((cy, i) => {
              const cx = 369 + (cy - 358) * 0.067;
              return <g key={cy}>
                <path d={`M ${cx - 1} ${cy} q 5 2 12 -1`} stroke="#384431" strokeWidth="3" fill="none" />
                <path d={`M ${cx} ${cy - 2} q 5 1 10 -1`} stroke="#b5b285" strokeOpacity="0.77" strokeWidth="1.4" fill="none" />
                {i % 2 === 0 && <path d={`M ${cx + 9} ${cy - 2} l 5 -5`} stroke="#66704b" strokeWidth="1.4" />}
              </g>;
            })}
            <path d="M 377 341 L 396 771" stroke="#cfbd80" strokeOpacity="0.42" strokeWidth="1.25" />
          </g>

          {/* Bent arm meets the bamboo; the loose sleeve has volume instead of a rigid line. */}
          <path d="M 294 273 Q 323 274 331 313 Q 334 347 340 360 Q 354 378 377 374 L 383 401 Q 351 425 319 403 Q 291 378 285 342 Z"
            fill={url('sleeve')} stroke="#2b4138" strokeWidth="2" />
          <path d="M 322 314 Q 316 350 339 391 M 332 363 Q 331 384 353 400 M 346 381 Q 358 395 374 392"
            stroke="#98a18a" strokeOpacity="0.42" strokeWidth="2.2" fill="none" />
          <path d="M 370 373 L 377 371 L 385 400 L 377 405 Q 371 391 370 373 Z" fill="#b0ad8c" />
          <path d="M 377 375 Q 385 366 389 369 Q 393 370 390 378 L 396 384 Q 396 393 391 398 L 380 396 Z"
            fill={url('skin')} stroke="#4a5340" strokeWidth="1.4" />
          <path d="M 386 380 l 7 4 M 385 385 l 8 4 M 384 390 l 7 4" stroke="#76795b" strokeWidth="1.2" />

          {/* Rain cape: irregular grass ends, multi-directional weaving, and hanging fibers. */}
          <path
            d={`M 174 247 Q 200 225 236 228 Q 305 219 339 265 Q 350 298 347 346 L 374 ${461 + wind * 0.2} L 382 507 L 357 496 L 368 525 L 340 509 L 340 541 L 318 526 L 311 552 L 292 535 L 278 563 L 260 543 L 238 564 L 228 542 L 198 555 L 199 531 L 170 540 L 177 515 L 145 524 L 153 495 L ${126 + wind} 503 Q 141 404 153 326 Q 158 279 174 247 Z`}
            fill={url('cape')} stroke="#3b4938" strokeWidth="2.2"
          />
          <g clipPath={url('capeClip')} fill="none" strokeLinecap="round">
            <path d="M 167 257 Q 228 217 331 266 L 338 291 Q 242 251 159 285 Z" fill="#a39c78" fillOpacity="0.44" stroke="none" />
            <path d="M 153 349 Q 249 312 354 360 M 144 423 Q 243 390 365 436" stroke="#263b30" strokeOpacity="0.22" strokeWidth="19" />
            {fibers.map((fiber, i) => <path key={i} d={fiber.path} stroke={fiber.color} strokeWidth={fiber.width} strokeOpacity={i % 4 === 0 ? 0.83 : 0.6} />)}
            {[276, 285, 330, 338, 387, 394, 445, 452].map((cy, i) => <path key={cy} d={`M 135 ${cy + 15} Q 230 ${cy - 28} 365 ${cy + 25}`} stroke={i % 2 ? '#343f2d' : '#aba27a'} strokeOpacity={i % 2 ? 0.5 : 0.35} strokeWidth={i % 2 ? 2.3 : 1.1} />)}
            <path d="M 184 249 Q 156 345 164 461 M 240 232 Q 217 382 227 548" stroke="#bab38a" strokeWidth="4" strokeOpacity="0.18" />
          </g>
          {/* Individual flyaway straws break up the outline at close camera distances. */}
          <g fill="none" stroke="#9b9771" strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round">
            <path d={`M 148 416 Q 135 460 ${125 + wind} 515 M 152 443 Q 142 483 ${141 + wind} 532 M 173 467 Q 158 514 165 548 M 200 488 Q 195 531 186 558 M 232 513 Q 229 548 238 572 M 265 512 Q 270 550 263 574 M 313 495 Q 324 531 320 558 M 343 453 Q 360 502 ${378 + wind * 0.3} 535`} />
          </g>
          <path d="M 184 250 Q 253 221 325 258" fill="none" stroke="#c4b489" strokeOpacity="0.58" strokeWidth="2" />
          <path d="M 313 262 Q 322 284 327 324" fill="none" stroke="#3b4635" strokeWidth="3" />

          {cold && <g transform={`translate(${Math.sin(t * 3) * 0.8} 0)`}>
            <path d="M 157 356 Q 170 327 190 314 Q 215 294 237 286 L 247 304 Q 215 335 190 363 Q 174 379 157 356 Z"
              fill={url('sleeve')} stroke="#344b3c" strokeWidth="2" />
            <path d="M 181 346 Q 200 324 225 310" stroke="#9ba68c" strokeOpacity="0.45" strokeWidth="2" fill="none" />
            <path d="M 231 291 Q 236 279 243 278 L 251 283 L 255 297 Q 249 307 240 305 Z" fill={url('skin')} stroke="#53604a" strokeWidth="1.5" />
            <path d="M 244 285 l 4 11 M 239 287 l 5 12" stroke="#6b7355" strokeWidth="1.2" />
          </g>}

          {/* Wide conical bamboo hat, with curved ribs, woven bands and a dark underside. */}
          <g transform={`rotate(${hatAngle} 267 166)`}>
            <path d="M 117 177 Q 154 200 259 204 Q 358 204 411 174 Q 375 150 264 146 Q 170 147 117 177 Z"
              fill={url('hatUnder')} stroke="#48513b" strokeWidth="2" />
            <path d="M 118 174 Q 168 153 205 117 Q 240 82 264 82 Q 292 88 327 122 Q 366 154 411 174 Q 350 190 266 193 Q 177 190 118 174 Z"
              fill={url('hat')} stroke="#62694a" strokeWidth="2" />
            {Array.from({length: 30}, (_, i) => {
              const f = i / 29;
              const bx = 124 + f * 280;
              const by = 175 + Math.sin(f * Math.PI) * 16;
              return <path key={`rib-${i}`} d={`M ${259 + (f - 0.5) * 18} ${86 + Math.abs(f - 0.5) * 7} Q ${255 + (bx - 255) * 0.45} ${123 + Math.sin(f * Math.PI) * 13} ${bx} ${by}`}
                stroke={i % 3 === 0 ? '#d0c294' : '#596246'} strokeOpacity={i % 3 === 0 ? 0.56 : 0.33} strokeWidth={i % 5 === 0 ? 1.6 : 0.85} fill="none" />;
            })}
            <path d="M 212 112 Q 264 129 321 118 M 191 131 Q 261 155 345 138 M 166 151 Q 264 178 376 158 M 139 167 Q 269 196 397 173"
              fill="none" stroke="#d0bd87" strokeOpacity="0.37" strokeWidth="1.5" />
            <path d="M 119 174 Q 264 210 410 174" stroke="#b3a77b" strokeWidth="3" fill="none" />
            <path d="M 131 179 Q 264 210 400 179" stroke="#394c3b" strokeWidth="2.8" fill="none" />
            <path d="M 202 187 Q 209 230 250 253 Q 276 245 289 201" fill="none" stroke="#9d9469" strokeWidth="1.8" />
            <path d="M 207 188 Q 222 223 253 246" fill="none" stroke="#433f2c" strokeOpacity="0.75" strokeWidth="1" />
            <path d="M 201 116 Q 237 82 263 83 Q 292 88 327 122" fill="none" stroke={url('rim')} strokeWidth="3.4" opacity={gold} />
            <path d="M 288 194 Q 359 191 409 174" fill="none" stroke="#f5d391" strokeWidth="3" opacity={gold * 0.72} />
          </g>

          {/* Sunlight is an edge treatment; it never flattens the quiet ink silhouette. */}
          <g fill="none" stroke={url('rim')} strokeLinecap="round" opacity={gold}>
            <path d="M 301 238 Q 338 249 344 290 Q 350 324 347 346" strokeWidth="5" />
            <path d="M 347 355 Q 351 407 366 457" strokeWidth="2.8" />
            <path d="M 311 581 Q 320 644 337 675" strokeWidth="2.1" />
          </g>
        </g>
      </g>
    </svg>
  );
};
