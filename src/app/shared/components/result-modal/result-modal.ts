import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
    selector: 'app-result-modal',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './result-modal.html',
    styleUrl: './result-modal.css'
})
export class ResultModal {
    readonly visible = input(false);
    readonly titulo = input('Resultado');
    readonly mensaje = input('');
    readonly tipo = input<'ganador' | 'perdedor' | 'empate'>('empate');

    readonly cerrar = output<void>();

    cerrarModal(): void {
        this.cerrar.emit();
    }
}
