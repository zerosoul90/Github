import { Component, Output, EventEmitter } from '@angular/core';
import { CollectionListEntry } from '../../../shared/collection-dropdown/collection-dropdown.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

/**
 * Wrap component for 'ds-collection-dropdown'.
 */
@Component({
  selector: 'ds-submission-import-external-collection',
  styleUrls: ['./submission-import-external-collection.component.scss'],
  templateUrl: './submission-import-external-collection.component.html'
})
export class SubmissionImportExternalCollectionComponent {
  /**
   * The event passed by 'ds-collection-dropdown'.
   */
  @Output() public selectedEvent = new EventEmitter<CollectionListEntry>();

  /**
   * If present this value is used to filter collection list by entity type
   */
  public entityType: string;

  /**
   * If a collection choice is available
   */
  public hasChoice: boolean = null;

  /**
   * Initialize the component variables.
   * @param {NgbActiveModal} activeModal
   */
  constructor(
    private activeModal: NgbActiveModal
  ) { }

  /**
   * This method populates the 'selectedEvent' variable.
   */
  public selectObject(event): void {
    this.selectedEvent.emit(event);
  }

  /**
   * This method closes the modal.
   */
  public closeCollectionModal(): void {
    this.activeModal.dismiss(false);
  }

  /**
   * Propagate the onlySelectable collection
   * @param theOnlySelectable
   */
  public theOnlySelectable(theOnlySelectable: CollectionListEntry) {
    this.selectedEvent.emit(theOnlySelectable);
  }

  /**
   * Set the hasChoice state
   * @param hasChoice
   */
  public onHasChoice(hasChoice: boolean) {
    this.hasChoice = hasChoice;
  }

  /**
   * If the component is in loading state.
   */
  public isLoading(): boolean {
    return this.hasChoice !== true;
  }
}
