import { Component, Input, OnInit } from '@angular/core';
import { Bitstream } from '../../core/shared/bitstream.model';
import { getBitstreamViewRoute } from '../../app-routing-paths';

@Component({
  selector: 'ds-file-view-link',
  templateUrl: './file-view-link.component.html',
  styleUrls: ['./file-view-link.component.scss']
})
/**
 * Component displaying a download link
 * When the user is authenticated, a short-lived token retrieved from the REST API is added to the download link,
 * ensuring the user is authorized to download the file.
 */
export class FileViewLinkComponent implements OnInit {

  /**
   * Optional bitstream instead of href and file name
   */
   @Input() bitstream: Bitstream;

   /**
    * Additional css classes to apply to link
    */
   @Input() cssClasses = '';
 
   /**
    * A boolean representing if link is shown in same tab or in a new one.
    */
   @Input() isBlank = false;
 
   bitstreamPath: string;
 
   ngOnInit() {
     this.bitstreamPath = this.getBitstreamPath();
   }
 
   getBitstreamPath() {
     return getBitstreamViewRoute(this.bitstream);
   }
}
