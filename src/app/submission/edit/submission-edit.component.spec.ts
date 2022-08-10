import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { of as observableOf } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SubmissionEditComponent } from './submission-edit.component';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';
import { SubmissionService } from '../submission.service';
import { SubmissionServiceStub } from '../../shared/testing/submission-service.stub';
import { getMockTranslateService } from '../../shared/mocks/translate.service.mock';

import { RouterStub } from '../../shared/testing/router.stub';
import { ActivatedRouteStub } from '../../shared/testing/active-router.stub';
import { mockSubmissionObject } from '../../shared/mocks/submission.mock';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { ItemDataService } from '../../core/data/item-data.service';
import { CollectionDataService } from '../../core/data/collection-data.service';
import { SubmissionJsonPatchOperationsServiceStub } from '../../shared/testing/submission-json-patch-operations-service.stub';
import { SubmissionJsonPatchOperationsService } from '../../core/submission/submission-json-patch-operations.service';
import { MetadataSecurityConfigurationService } from '../../core/submission/metadatasecurityconfig-data.service';

describe('SubmissionEditComponent Component', () => {

  let comp: SubmissionEditComponent;
  let fixture: ComponentFixture<SubmissionEditComponent>;
  let submissionServiceStub: SubmissionServiceStub;
  let itemDataService: ItemDataService;
  let metadataSecurityConfigDataService: MetadataSecurityConfigurationService;
  let submissionJsonPatchOperationsServiceStub: SubmissionJsonPatchOperationsServiceStub;
  let router: RouterStub;

  const submissionId = '826';
  const route: ActivatedRouteStub = new ActivatedRouteStub();
  const submissionObject: any = mockSubmissionObject;
  const collectionDataService: any = jasmine.createSpyObj('collectionDataService', {
    findById: jasmine.createSpy('findById'),
    getAuthorizedCollectionByCommunity: jasmine.createSpy('getAuthorizedCollectionByCommunity'),
    getAuthorizedCollectionByCommunityAndEntityType: jasmine.createSpy('getAuthorizedCollectionByCommunityAndEntityType')
  });

  beforeEach(waitForAsync(() => {
    itemDataService = jasmine.createSpyObj('itemDataService', {
      findByHref: createSuccessfulRemoteDataObject$(submissionObject.item),
    });
    metadataSecurityConfigDataService = jasmine.createSpyObj('metadataSecurityConfigDataService', {
      findById: createSuccessfulRemoteDataObject$(submissionObject.metadataSecurityConfiguration),
    });
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule.withRoutes([
          { path: ':id/edit', component: SubmissionEditComponent, pathMatch: 'full' },
        ])
      ],
      declarations: [SubmissionEditComponent],
      providers: [
        { provide: NotificationsService, useClass: NotificationsServiceStub },
        { provide: SubmissionService, useClass: SubmissionServiceStub },
        { provide: SubmissionJsonPatchOperationsService, useClass: SubmissionJsonPatchOperationsServiceStub },
        { provide: ItemDataService, useValue: itemDataService },
        { provide: MetadataSecurityConfigurationService, useValue: metadataSecurityConfigDataService },
        { provide: CollectionDataService, useValue: collectionDataService },
        { provide: SubmissionJsonPatchOperationsService, useClass: SubmissionJsonPatchOperationsServiceStub },
        { provide: TranslateService, useValue: getMockTranslateService() },
        { provide: Router, useValue: new RouterStub() },
        { provide: ActivatedRoute, useValue: route },

      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionEditComponent);
    comp = fixture.componentInstance;
    submissionServiceStub = TestBed.inject(SubmissionService as any);
    submissionJsonPatchOperationsServiceStub = TestBed.inject(SubmissionJsonPatchOperationsService as any);
    router = TestBed.inject(Router as any);
  });

  afterEach(() => {
    comp = null;
    fixture = null;
    router = null;
  });

  it('should init properly when a valid SubmissionObject has been retrieved',() => {

    route.testParams = { id: submissionId };
    submissionServiceStub.retrieveSubmission.and.returnValue(
      createSuccessfulRemoteDataObject$(submissionObject)
    );

    fixture.detectChanges();

    expect(comp.submissionId).toBe(submissionId);
    expect(comp.collectionId).toBe(submissionObject.collection.id);
    expect(comp.selfUrl).toBe(submissionObject._links.self.href);
    expect(comp.sections).toBe(submissionObject.sections);
    expect(comp.submissionDefinition).toBe(submissionObject.submissionDefinition);

  });

  it('should redirect to mydspace when an empty SubmissionObject has been retrieved',() => {

    route.testParams = { id: submissionId };
    submissionServiceStub.retrieveSubmission.and.returnValue(createSuccessfulRemoteDataObject$({})
    );

    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalled();

  });

  it('should not has effects when an invalid SubmissionObject has been retrieved',() => {

    route.testParams = { id: submissionId };
    submissionServiceStub.retrieveSubmission.and.returnValue(observableOf(null));

    fixture.detectChanges();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(comp.collectionId).toBeUndefined();
    expect(comp.selfUrl).toBeUndefined();
    expect(comp.sections).toBeUndefined();
    expect(comp.submissionDefinition).toBeUndefined();
  });

  describe('ngOnDestroy', () => {
    it('should call delete pending json patch operations', fakeAsync(() => {

      submissionJsonPatchOperationsServiceStub.deletePendingJsonPatchOperations.and.callFake(() => { /* */ });
      comp.ngOnDestroy();

      expect(submissionJsonPatchOperationsServiceStub.deletePendingJsonPatchOperations).toHaveBeenCalled();
    }));

  });


});
