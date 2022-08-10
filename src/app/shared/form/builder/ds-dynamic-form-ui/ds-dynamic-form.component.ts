import {
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  DynamicFormComponent,
  DynamicFormComponentService,
  DynamicFormControlContainerComponent,
  DynamicFormControlEvent,
  DynamicFormControlModel,
  DynamicFormLayout,
  DynamicTemplateDirective,
} from '@ng-dynamic-forms/core';
import { DsDynamicFormControlContainerComponent } from './ds-dynamic-form-control-container.component';

@Component({
  selector: 'ds-dynamic-form',
  templateUrl: './ds-dynamic-form.component.html'
})
export class DsDynamicFormComponent extends DynamicFormComponent {

  @Input() formId: string;
  @Input() formGroup: FormGroup;
  @Input() formModel: DynamicFormControlModel[];
  @Input() formLayout: DynamicFormLayout;
  @Input() entityType: string;
  /* tslint:disable:no-output-rename */
  @Output('dfBlur') blur: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
  @Output('dfChange') change: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();
  @Output('dfFocus') focus: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();

  /* tslint:enable:no-output-rename */

  @Output() ngbEvent: EventEmitter<DynamicFormControlEvent> = new EventEmitter<DynamicFormControlEvent>();

  @ContentChildren(DynamicTemplateDirective) templates: QueryList<DynamicTemplateDirective>;

  @ViewChildren(DsDynamicFormControlContainerComponent) components: QueryList<DynamicFormControlContainerComponent>;

  constructor(changeDetectorRef: ChangeDetectorRef, componentService: DynamicFormComponentService) {
    super(changeDetectorRef, componentService);
  }
}
