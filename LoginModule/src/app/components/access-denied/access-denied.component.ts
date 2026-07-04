import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-access-denied',
    templateUrl: './access-denied.component.html',
    styleUrls: ['./access-denied.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [FaIconComponent]
})
export class AccessDeniedComponent {

}
