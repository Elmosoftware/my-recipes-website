import { animation, animate, style, keyframes, group } from '@angular/animations';

export const horizontalSlideIn = animation([
  style({ transform: "translateX(-100%)" }),
  animate('{{ time }}', style({ transform: "translateX(0%)" }))
]);

export const horizontalSlideOut = animation([
  style({ transform: "translateX(0%)" }),
  animate('{{ time }}', style({ transform: "translateX(-100%)" }))
]);

export const zoomIn = animation(
  group([
    animate(
      '{{ time }}',
      keyframes([
        style({ opacity: 0, easing: 'ease', offset: 0 }),
        style({ opacity: 1, easing: 'ease', offset: 1 })
      ])
    ),
    animate(
      '{{ time }}',
      keyframes([
        style({ visibility: 'visible', transform: 'scale3d(0.3, 0.3, 0.3)', easing: 'ease', offset: 0 }),
        style({ transform: 'scale3d(1, 1, 1)', easing: 'ease', offset: 1 })
      ])
    )
  ])
);

export const rotateIn = animation([
  style({filter: "invert(1)", transform: 'rotate(180deg)', easing: 'ease'}),
  animate('{{ time }}', style({ filter: "invert(0)", transform: 'rotate(0deg)', easing: 'ease'}))
]);
