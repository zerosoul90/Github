import { Component } from '@angular/core';
import { listableObjectComponent } from '../../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { ViewMode } from '../../../../../core/shared/view-mode.model';
import { ItemSearchResultListElementComponent } from '../../../../../shared/object-list/search-result-list-element/item-search-result/item-types/item/item-search-result-list-element.component';
import { TruncatableService } from '../../../../../shared/truncatable/truncatable.service';
import { DSONameService } from '../../../../../core/breadcrumbs/dso-name.service';

@listableObjectComponent('JournalIssueSearchResult', ViewMode.ListElement)
@Component({
  selector: 'ds-journal-issue-search-result-list-element',
  styleUrls: ['./journal-issue-search-result-list-element.component.scss'],
  templateUrl: './journal-issue-search-result-list-element.component.html'
})
/**
 * The component for displaying a list element for an item search result of the type Journal Issue
 */
export class JournalIssueSearchResultListElementComponent extends ItemSearchResultListElementComponent {

  public constructor(protected truncatableService: TruncatableService, protected dsoNameService: DSONameService) {
    super(truncatableService, dsoNameService);
  }

}
