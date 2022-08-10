import { Component } from '@angular/core';

import { FieldRenderingType, MetadataBoxFieldRendering } from '../metadata-box.decorator';
import { RenderingTypeModelComponent } from '../rendering-type.model';

/**
 * This component renders the longtext metadata fields
 */
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'div[ds-longtext]',
  templateUrl: './longtext.component.html',
  styleUrls: ['./longtext.component.scss']
})
@MetadataBoxFieldRendering(FieldRenderingType.LONGTEXT)
export class LongtextComponent extends RenderingTypeModelComponent { }
