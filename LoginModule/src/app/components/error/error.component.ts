import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FaIconComponent]
})
export class ErrorComponent {

}
