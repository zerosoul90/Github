import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

import { CrisItemPageRoutingModule } from './cris-item-page-routing.module';
import { CrisItemPageComponent } from './cris-item-page.component';
import { LayoutModule } from '../layout/layout.module';
import { CrisItemPageTabResolver } from './cris-item-page-tab.resolver';
import {StatisticsModule} from '../statistics/statistics.module';

@NgModule({
  declarations: [
    CrisItemPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CrisItemPageRoutingModule,
    LayoutModule,
    StatisticsModule
  ],
  exports: [
    CrisItemPageComponent
  ],
  providers: [
    CrisItemPageTabResolver
  ]
})
export class CrisItemPageModule { }
