import { animation, animate, style } from '@angular/animations';

export const horizontalSlideIn = animation([
    style({ transform: "translateX(-100%)" }),
    animate('{{ time }}', style({ transform: "translateX(0%)" }))
]);

export const horizontalSlideOut = animation([
    animate('{{ time }}', style({ transform: "translateX(-100%)" }))
]);
