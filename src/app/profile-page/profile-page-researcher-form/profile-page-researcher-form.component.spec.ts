import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { of as observableOf } from 'rxjs';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { NotificationsServiceStub } from '../../shared/testing/notifications-service.stub';

import { EPerson } from '../../core/eperson/models/eperson.model';
import { ResearcherProfile } from '../../core/profile/model/researcher-profile.model';
import { ResearcherProfileService } from '../../core/profile/researcher-profile.service';
import { VarDirective } from '../../shared/utils/var.directive';
import { ProfilePageResearcherFormComponent } from './profile-page-researcher-form.component';
import { ProfileClaimService } from '../profile-claim/profile-claim.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/core/auth/auth.service';
import { EditItemDataService } from '../../core/submission/edititem-data.service';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { EditItemMode } from '../../core/submission/models/edititem-mode.model';
import { EditItem } from '../../core/submission/models/edititem.model';
import { createPaginatedList } from '../../shared/testing/utils.test';

describe('ProfilePageResearcherFormComponent', () => {

  let component: ProfilePageResearcherFormComponent;
  let fixture: ComponentFixture<ProfilePageResearcherFormComponent>;
  let router: Router;

  let user: EPerson;
  let profile: ResearcherProfile;

  let researcherProfileService: ResearcherProfileService;

  let notificationsServiceStub: NotificationsServiceStub;

  let profileClaimService: ProfileClaimService;

  let authService: AuthService;

  let editItemDataService: any;

  const editItemMode: EditItemMode = Object.assign(new EditItemMode(), {
    name: 'test',
    label: 'test'
  });

  const editItem: EditItem = Object.assign(new EditItem(), {
    modes: createSuccessfulRemoteDataObject$(createPaginatedList([editItemMode]))
  });

  function init() {

    user = Object.assign(new EPerson(), {
      id: 'beef9946-f4ce-479e-8f11-b90cbe9f7241'
    });

    profile = Object.assign(new ResearcherProfile(), {
      id: 'beef9946-f4ce-479e-8f11-b90cbe9f7241',
      visible: false,
      type: 'profile'
    });

    authService = jasmine.createSpyObj('authService', {
      getAuthenticatedUserFromStore: observableOf(user)
    });

    researcherProfileService = jasmine.createSpyObj('researcherProfileService', {
      findById: observableOf(profile),
      create: observableOf(profile),
      setVisibility: observableOf(profile),
      delete: observableOf(true),
      findRelatedItemId: observableOf('a42557ca-cbb8-4442-af9c-3bb5cad2d075')
    });

    notificationsServiceStub = new NotificationsServiceStub();

    profileClaimService = jasmine.createSpyObj('profileClaimService', {
      canClaimProfiles: observableOf(false),
    });

    editItemDataService = jasmine.createSpyObj('EditItemDataService', {
      findById: createSuccessfulRemoteDataObject$(editItem)
    });

  }

  beforeEach(waitForAsync(() => {
    init();
    TestBed.configureTestingModule({
      declarations: [ProfilePageResearcherFormComponent, VarDirective],
      imports: [TranslateModule.forRoot(), RouterTestingModule.withRoutes([])],
      providers: [
        NgbModal,
        { provide: ResearcherProfileService, useValue: researcherProfileService },
        { provide: NotificationsService, useValue: notificationsServiceStub },
        { provide: ProfileClaimService, useValue: profileClaimService },
        { provide: AuthService, useValue: authService },
        { provide: EditItemDataService, useValue: editItemDataService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilePageResearcherFormComponent);
    component = fixture.componentInstance;
    component.user = user;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should search the researcher profile for the current user', () => {
    expect(researcherProfileService.findById).toHaveBeenCalledWith(user.id);
  });

  describe('createProfile', () => {

    it('should create the profile', () => {
      component.createProfile();
      expect(researcherProfileService.create).toHaveBeenCalledWith();
    });

  });

  describe('toggleProfileVisibility', () => {

    it('should set the profile visibility to true', () => {
      profile.visible = false;
      component.toggleProfileVisibility(profile);
      expect(researcherProfileService.setVisibility).toHaveBeenCalledWith(profile, true);
    });

    it('should set the profile visibility to false', () => {
      profile.visible = true;
      component.toggleProfileVisibility(profile);
      expect(researcherProfileService.setVisibility).toHaveBeenCalledWith(profile, false);
    });

  });

  describe('deleteProfile', () => {

    it('should delete the profile', () => {
      component.deleteProfile(profile);
      expect(researcherProfileService.delete).toHaveBeenCalledWith(profile);
    });

  });

  describe('viewProfile', () => {

    it('should open the item details page', () => {
      spyOn(router, 'navigate');
      component.viewProfile(profile);
      expect(router.navigate).toHaveBeenCalledWith(['items', 'a42557ca-cbb8-4442-af9c-3bb5cad2d075']);
    });

  });

});
