import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { OrcidComponent } from './orcid.component';
import { Item } from '../../../../../core/shared/item.model';
import { TranslateLoaderMock } from '../../../../../shared/mocks/translate-loader.mock';
import { DsDatePipe } from '../../../../pipes/ds-date.pipe';
import { MetadataComponent } from '../../../../../core/layout/models/metadata-component.model';
import { METADATACOMPONENT } from '../../../../../core/layout/models/metadata-component.resource-type';
import { ConfigurationDataService } from '../../../../../core/data/configuration-data.service';
import { createSuccessfulRemoteDataObject$ } from '../../../../../shared/remote-data.utils';

export const testItem: Item = Object.assign(new Item(), {
  id: '0ec7ff22-f211-40ab-a69e-c819b0b1f357',
  uuid: '0ec7ff22-f211-40ab-a69e-c819b0b1f357',
  type: 'item',
  metadata: {
    'person.identifier.orcid': [
      {
        language: 'en_US',
        value: '0000-0001-8918-3592'
      }
    ],
    'cris.orcid.authenticated': [
      {
        language: null,
        value: 'authenticated'
      }
    ]
  }
});

export const medataComponent: MetadataComponent = {
  id: '1',
  type: METADATACOMPONENT,
  rows: [
    {
      fields: [
        {
          metadata: 'person.identifier.orcid',
          label: 'ORCID',
          rendering: 'orcid',
          fieldType: 'metadata',
          style: 'field-0-style'
        }
      ]
    }
  ]
  ,
  _links: {
    self: {
      href: 'https://rest.api/rest/api/metadatacomponent/1'
    }
  }
};

describe('OrcidComponent', () => {
  let component: OrcidComponent;
  let fixture: ComponentFixture<OrcidComponent>;
  let configurationDataService;

  beforeEach(fakeAsync(() => {

    configurationDataService = jasmine.createSpyObj('configurationDataService', {
      findByPropertyName: createSuccessfulRemoteDataObject$({ values: ['https://sandbox.orcid.org'] })
    });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateLoaderMock
        }
      }), BrowserAnimationsModule],
      declarations: [ OrcidComponent, DsDatePipe ],
      providers: [ { provide: ConfigurationDataService, useValue: configurationDataService}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrcidComponent);
    component = fixture.componentInstance;
    component.item = testItem;
    component.field = medataComponent.rows[0].fields[0];
    component.ngOnInit();
    fixture.detectChanges();
  });

  it('check metadata rendering',  fakeAsync(() => {
    tick();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      const spanValueFound = fixture.debugElement.queryAll(By.css('span.txt-value'));
      expect(spanValueFound.length).toBe(1);
      expect(spanValueFound[0].nativeElement.textContent).toContain('0000-0001-8918-3592');

      const orcidLinkFound = fixture.debugElement.queryAll(By.css('a'));
      expect(orcidLinkFound.length).toBe(1);
      expect(orcidLinkFound[0].nativeElement.href).toBe('https://sandbox.orcid.org/0000-0001-8918-3592');

      const orcidIconFound = fixture.debugElement.queryAll(By.css('.orcid-icon'));
      expect(orcidIconFound.length).toBe(1);
      expect(orcidIconFound[0].nativeElement.src).toContain('assets/images/orcid.logo.icon.svg');

      const spanLabelFound = fixture.debugElement.query(By.css('div.' + medataComponent.rows[0].fields[0].style));
      const label: HTMLElement = spanLabelFound.nativeElement;
      expect(label.textContent).toContain(medataComponent.rows[0].fields[0].label);
    });

  }));
});
