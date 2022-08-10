import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { CrisLayoutBoxModelComponent as CrisLayoutBoxObj } from '../../../models/cris-layout-box.model';
import { CrisLayoutBox } from '../../../decorators/cris-layout-box.decorator';
import { LayoutTab } from '../../../enums/layout-tab.enum';
import { LayoutBox } from '../../../enums/layout-box.enum';
import { LayoutPage } from '../../../enums/layout-page.enum';
import {
  getAllSucceededRemoteDataPayload,
  getFirstSucceededRemoteDataPayload
} from '../../../../core/shared/operators';
import { Subscription } from 'rxjs';
import { hasValue } from '../../../../shared/empty.util';
import { MetricsComponent } from '../../../../core/layout/models/metrics-component.model';
import { MetricsComponentsDataService } from '../../../../core/layout/metrics-components-data.service';
import { Metric } from '../../../../core/shared/metric.model';
import { ItemDataService } from '../../../../core/data/item-data.service';
import { TranslateService } from '@ngx-translate/core';

export interface MetricRow {
  metrics: Metric[];
}

/**
 * This component renders the metadata boxes of items
 */
@Component({
  selector: 'ds-cris-layout-metrics-box',
  templateUrl: './cris-layout-metrics-box.component.html',
  styleUrls: ['./cris-layout-metrics-box.component.scss']
})
/**
 * For overwrite this component create a new one that extends CrisLayoutBoxObj and
 * add the CrisLayoutBoxModelComponent decorator indicating the type of box to overwrite
 */
@CrisLayoutBox(LayoutPage.DEFAULT, LayoutTab.DEFAULT, LayoutBox.METRICS)
export class CrisLayoutMetricsBoxComponent extends CrisLayoutBoxObj implements OnInit, OnDestroy {

  /**
   * Contains the fields configuration for current box
   */
  metricscomponents: MetricsComponent;

  /**
   * Computed metric rows for the item and the current box
   */
  metricRows: MetricRow[];

  /**
   * true if the item has a thumbnail, false otherwise
   */
  hasThumbnail = false;

  /**
   * List of subscriptions
   */
  subs: Subscription[] = [];

  /**
   * Variable to understand if the next box clear value
   */
  nextBoxClear = true;

  /**
   * Dynamic styling of the component host selector
   */
  @HostBinding('style.flex') flex = '1';
  /**
   * Dynamic styling of the component host selector
   */
  @HostBinding('style.marginRight') margin = '0px';

  constructor(
    public cd: ChangeDetectorRef,
    protected metricscomponentsService: MetricsComponentsDataService,
    protected itemService: ItemDataService,
    protected translateService: TranslateService
  ) {
    super(translateService);
  }

  ngOnInit() {
    super.ngOnInit();

    if (this.box.clear) {
      this.flex = '0 0 100%';
    }

    if (!this.box.clear && !this.nextBoxClear) {
      this.margin = '10px';
    }

    this.subs.push(this.metricscomponentsService.findById(this.box.id)
      .pipe(getAllSucceededRemoteDataPayload())
      .subscribe(
        (next) => {
          this.metricscomponents = next;
          this.itemService.getMetrics(this.item.uuid).pipe(getFirstSucceededRemoteDataPayload()).subscribe((result) => {
            this.metricRows = this.metricscomponentsService
              .getMatchingMetrics(result.page, this.box.maxColumns, this.metricscomponents.metrics);
            this.cd.markForCheck();
          });
        }
      ));
  }

  /**
   * Unsubscribes all subscriptions
   */
  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }
}
