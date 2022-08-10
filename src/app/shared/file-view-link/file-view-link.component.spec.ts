import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FileViewLinkComponent } from './file-view-link.component';
import { AuthService } from '../../core/auth/auth.service';
import { FileService } from '../../core/shared/file.service';
import { of as observableOf } from 'rxjs';
import { Bitstream } from '../../core/shared/bitstream.model';
import { By } from '@angular/platform-browser';
import { URLCombiner } from '../../core/url-combiner/url-combiner';
import { getBitstreamModuleRoute } from '../../app-routing-paths';

describe('FileDownloadLinkComponent', () => {
  let component: FileViewLinkComponent;
  let fixture: ComponentFixture<FileViewLinkComponent>;

  let authService: AuthService;
  let fileService: FileService;
  let bitstream: Bitstream;

  function init() {
    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: observableOf(true)
    });
    fileService = jasmine.createSpyObj('fileService', ['viewFile']);
    bitstream = Object.assign(new Bitstream(), {
      uuid: 'bitstreamUuid',
    });
  }

  beforeEach(waitForAsync(() => {
    init();
    TestBed.configureTestingModule({
      declarations: [FileViewLinkComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: FileService, useValue: fileService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileViewLinkComponent);
    component = fixture.componentInstance;
    component.bitstream = bitstream;
    fixture.detectChanges();
  });

  describe('init', () => {

    describe('getBitstreamPath', () => {
      it('should set the bitstreamPath based on the input bitstream', () => {
        expect(component.bitstreamPath).toEqual(new URLCombiner(getBitstreamModuleRoute(), bitstream.uuid, 'view').toString());
      });
    });

    it('should init the component', () => {
      const link = fixture.debugElement.query(By.css('a')).nativeElement;
      expect(link.href).toContain(new URLCombiner(getBitstreamModuleRoute(), bitstream.uuid, 'view').toString());
    });

  });
});
