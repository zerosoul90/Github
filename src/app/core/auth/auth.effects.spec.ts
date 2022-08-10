import { TestBed } from '@angular/core/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cold, hot } from 'jasmine-marbles';
import { Observable, of as observableOf, throwError as observableThrow } from 'rxjs';

import { AuthEffects } from './auth.effects';
import {
  AuthActionTypes,
  AuthenticatedAction,
  AuthenticatedErrorAction,
  AuthenticatedSuccessAction,
  AuthenticationErrorAction,
  AuthenticationSuccessAction,
  CheckAuthenticationTokenCookieAction,
  LogOutErrorAction,
  LogOutSuccessAction,
  RefreshTokenAndRedirectErrorAction,
  RefreshTokenAndRedirectSuccessAction,
  RefreshTokenErrorAction,
  RefreshTokenSuccessAction,
  RetrieveAuthenticatedEpersonAction,
  RetrieveAuthenticatedEpersonErrorAction,
  RetrieveAuthenticatedEpersonSuccessAction,
  RetrieveAuthMethodsAction,
  RetrieveAuthMethodsErrorAction,
  RetrieveAuthMethodsSuccessAction,
  RetrieveTokenAction
} from './auth.actions';
import { authMethodsMock, AuthServiceStub } from '../../shared/testing/auth-service.stub';
import { AuthService } from './auth.service';
import { authReducer } from './auth.reducer';
import { AuthStatus } from './models/auth-status.model';
import { EPersonMock } from '../../shared/testing/eperson.mock';
import { AppState, storeModuleConfig } from '../../app.reducer';
import { StoreActionTypes } from '../../store.actions';
import { isAuthenticated, isAuthenticatedLoaded } from './selectors';
import { AuthorizationDataService } from '../data/feature-authorization/authorization-data.service';
import { Router } from '@angular/router';
import { RouterStub } from '../../shared/testing/router.stub';
import { take } from 'rxjs/operators';

describe('AuthEffects', () => {
  let authEffects: AuthEffects;
  let actions: Observable<any>;
  let authServiceStub;
  let initialState;
  let token;
  let store: MockStore<AppState>;
  let routerStub;
  let redirectUrl;
  let authStatus;

  const authorizationService = jasmine.createSpyObj(['invalidateAuthorizationsRequestCache']);

  function init() {
    routerStub = new RouterStub();
    authServiceStub = new AuthServiceStub();
    token = authServiceStub.getToken();
    redirectUrl = '/redirect-url';
    authStatus = Object.assign(new AuthStatus(), {});
    initialState = {
      core: {
        auth: {
          authenticated: false,
          loaded: false,
          loading: false,
          authMethods: []
        }
      }
    };
  }

  beforeEach(() => {
    init();
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({ auth: authReducer }, storeModuleConfig)
      ],
      providers: [
        AuthEffects,
        provideMockStore({ initialState }),
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: AuthService, useValue: authServiceStub },
        provideMockActions(() => actions),
        { provide: Router, useValue: routerStub },
        // other providers
      ],
    });

    authEffects = TestBed.inject(AuthEffects);
    store = TestBed.inject(Store as any);
  });

  describe('authenticate$', () => {
    describe('when credentials are correct', () => {
      it('should return a AUTHENTICATE_SUCCESS action in response to a AUTHENTICATE action', (done) => {
        actions = hot('--a-', {
          a: {
            type: AuthActionTypes.AUTHENTICATE,
            payload: { email: 'user', password: 'password' }
          }
        });

        const expected = cold('--b-', { b: new AuthenticationSuccessAction(token) });

        expect(authEffects.authenticate$).toBeObservable(expected);
        done();
      });
    });

    describe('when credentials are wrong', () => {
      it('should return a AUTHENTICATE_ERROR action in response to a AUTHENTICATE action', (done) => {
        spyOn((authEffects as any).authService, 'authenticate').and.returnValue(observableThrow(new Error('Message Error test')));

        actions = hot('--a-', {
          a: {
            type: AuthActionTypes.AUTHENTICATE,
            payload: { email: 'user', password: 'wrongpassword' }
          }
        });

        const expected = cold('--b-', { b: new AuthenticationErrorAction(new Error('Message Error test')) });

        expect(authEffects.authenticate$).toBeObservable(expected);
        done();
      });
    });
  });

  describe('authenticateSuccess$', () => {

    it('should return a AUTHENTICATED action in response to a AUTHENTICATE_SUCCESS action', (done) => {
      actions = hot('--a-', { a: { type: AuthActionTypes.AUTHENTICATE_SUCCESS, payload: token } });

      const expected = cold('--b-', { b: new AuthenticatedAction(token) });

      expect(authEffects.authenticateSuccess$).toBeObservable(expected);
      done();
    });
  });

  describe('authenticated$', () => {

    describe('when token is valid', () => {
      it('should return a AUTHENTICATED_SUCCESS action in response to a AUTHENTICATED action', (done) => {
        actions = hot('--a-', { a: { type: AuthActionTypes.AUTHENTICATED, payload: token } });

        const expected = cold('--b-', { b: new AuthenticatedSuccessAction(true, token, EPersonMock._links.self.href) });

        expect(authEffects.authenticated$).toBeObservable(expected);
        done();
      });
    });

    describe('when token is not valid', () => {
      it('should return a AUTHENTICATED_ERROR action in response to a AUTHENTICATED action', (done) => {
        spyOn((authEffects as any).authService, 'authenticatedUser').and.returnValue(observableThrow(new Error('Message Error test')));

        actions = hot('--a-', { a: { type: AuthActionTypes.AUTHENTICATED, payload: token } });

        const expected = cold('--b-', { b: new AuthenticatedErrorAction(new Error('Message Error test')) });

        expect(authEffects.authenticated$).toBeObservable(expected);
        done();
      });
    });
  });

  describe('authenticatedSuccess$', () => {

    it('should return a RETRIEVE_AUTHENTICATED_EPERSON action in response to a AUTHENTICATED_SUCCESS action', (done) => {
      spyOn((authEffects as any).authService, 'storeToken');
      actions = hot('--a-', {
        a: {
          type: AuthActionTypes.AUTHENTICATED_SUCCESS, payload: {
            authenticated: true,
            authToken: token,
            userHref: EPersonMock._links.self.href
          }
        }
      });

      const expected = cold('--b-', { b: new RetrieveAuthenticatedEpersonAction(EPersonMock._links.self.href) });

      authEffects.authenticatedSuccess$.subscribe(() => {
        expect(authServiceStub.storeToken).toHaveBeenCalledWith(token);
      });

      expect(authEffects.authenticatedSuccess$).toBeObservable(expected);
      done();
    });

  });

  describe('checkToken$', () => {

    describe('when check token succeeded', () => {
      it('should return a AUTHENTICATED action in response to a CHECK_AUTHENTICATION_TOKEN action', (done) => {

        actions = hot('--a-', { a: { type: AuthActionTypes.CHECK_AUTHENTICATION_TOKEN } });

        const expected = cold('--b-', { b: new AuthenticatedAction(token) });

        expect(authEffects.checkToken$).toBeObservable(expected);
        done();
      });
    });

    describe('when check token failed', () => {
      it('should return a CHECK_AUTHENTICATION_TOKEN_ERROR action in response to a CHECK_AUTHENTICATION_TOKEN action', (done) => {
        spyOn((authEffects as any).authService, 'hasValidAuthenticationToken').and.returnValue(observableThrow(''));

        actions = hot('--a-', { a: { type: AuthActionTypes.CHECK_AUTHENTICATION_TOKEN, payload: token } });

        const expected = cold('--b-', { b: new CheckAuthenticationTokenCookieAction() });

        expect(authEffects.checkToken$).toBeObservable(expected);
        done();
      });
    });
  });

  describe('checkTokenCookie$', () => {

    describe('when check token succeeded', () => {
      it('should return a RETRIEVE_TOKEN action in response to a CHECK_AUTHENTICATION_TOKEN_COOKIE action when authenticated is true', (done) => {
        spyOn((authEffects as any).authService, 'checkAuthenticationCookie').and.returnValue(
          observableOf(
            {
              authenticated: true
            })
        );
        actions = hot('--a-', { a: { type: AuthActionTypes.CHECK_AUTHENTICATION_TOKEN_COOKIE } });

        const expected = cold('--b-', { b: new RetrieveTokenAction() });

        expect(authEffects.checkTokenCookie$).toBeObservable(expected);
        done();
      });

      it('should return a RETRIEVE_AUTH_METHODS action in response to a CHECK_AUTHENTICATION_TOKEN_COOKIE action when authenticated is false', () => {
        spyOn((authEffects as any).authService, 'checkAuthenticationCookie').and.returnValue(
          observableOf(
            { authenticated: false })
        );
        actions = hot('--a-', { a: { type: AuthActionTypes.CHECK_AUTHENTICATION_TOKEN_COOKIE } });

        const expected = cold('--b-', { b: new RetrieveAuthMethodsAction({ authenticated: false } as AuthStatus) });

        expect(authEffects.checkTokenCookie$).toBeObservable(expected);
      });
    });

    describe('when check token failed', () => {
      it('should return a AUTHENTICATED_ERROR action in response to a CHECK_AUTHENTICATION_TOKEN_COOKIE action', (done) => {
        spyOn((authEffects as any).authService, 'checkAuthenticationCookie').and.returnValue(observableThrow(new Error('Message Error test')));

        actions = hot('--a-', { a: { type: AuthActionTypes.CHECK_AUTHENTICATION_TOKEN_COOKIE, payload: token } });

        const expected = cold('--b-', { b: new AuthenticatedErrorAction(new Error('Message Error test')) });

        expect(authEffects.checkTokenCookie$).toBeObservable(expected);
        done();
      });
    });
  });

  describe('retrieveAuthenticatedEperson$', () => {

    describe('when request is successful', () => {
      it('should return a RETRIEVE_AUTHENTICATED_EPERSON_SUCCESS action in response to a RETRIEVE_AUTHENTICATED_EPERSON action', (done) => {
        actions = hot('--a-', {
          a: {
            type: AuthActionTypes.RETRIEVE_AUTHENTICATED_EPERSON,
            payload: EPersonMock._links.self.href
          }
        });

        const expected = cold('--b-', { b: new RetrieveAuthenticatedEpersonSuccessAction(EPersonMock) });

        expect(authEffects.retrieveAuthenticatedEperson$).toBeObservable(expected);
        done();
      });
    });

    describe('when request is not successful', () => {
      it('should return a RETRIEVE_AUTHENTICATED_EPERSON_ERROR action in response to a RETRIEVE_AUTHENTICATED_EPERSON action', (done) => {
        spyOn((authEffects as any).authService, 'retrieveAuthenticatedUserByHref').and.returnValue(observableThrow(new Error('Message Error test')));

        actions = hot('--a-', { a: { type: AuthActionTypes.RETRIEVE_AUTHENTICATED_EPERSON, payload: token } });

        const expected = cold('--b-', { b: new RetrieveAuthenticatedEpersonErrorAction(new Error('Message Error test')) });

        expect(authEffects.retrieveAuthenticatedEperson$).toBeObservable(expected);
        done();
      });
    });
  });

  describe('refreshToken$', () => {

    describe('when refresh token succeeded', () => {
      it('should return a REFRESH_TOKEN_SUCCESS action in response to a REFRESH_TOKEN action', (done) => {

        actions = hot('--a-', { a: { type: AuthActionTypes.REFRESH_TOKEN } });

        const expected = cold('--b-', { b: new RefreshTokenSuccessAction(token) });

        expect(authEffects.refreshToken$).toBeObservable(expected);
        done();
      });
    });

    describe('when refresh token failed', () => {
      it('should return a REFRESH_TOKEN_ERROR action in response to a REFRESH_TOKEN action', (done) => {
        spyOn((authEffects as any).authService, 'refreshAuthenticationToken').and.returnValue(observableThrow(''));

        actions = hot('--a-', { a: { type: AuthActionTypes.REFRESH_TOKEN, payload: token } });

        const expected = cold('--b-', { b: new RefreshTokenErrorAction() });

        expect(authEffects.refreshToken$).toBeObservable(expected);
        done();
      });
    });
  });

  describe('retrieveToken$', () => {
    describe('when user is authenticated', () => {
      it('should return a AUTHENTICATE_SUCCESS action in response to a RETRIEVE_TOKEN action', (done) => {
        actions = hot('--a-', {
          a: {
            type: AuthActionTypes.RETRIEVE_TOKEN
          }
        });

        const expected = cold('--b-', { b: new AuthenticationSuccessAction(token) });

        expect(authEffects.retrieveToken$).toBeObservable(expected);
        done();
      });
    });

    describe('when user is not authenticated', () => {
      it('should return a AUTHENTICATE_ERROR action in response to a RETRIEVE_TOKEN action', (done) => {
        spyOn((authEffects as any).authService, 'refreshAuthenticationToken').and.returnValue(observableThrow(new Error('Message Error test')));

        actions = hot('--a-', {
          a: {
            type: AuthActionTypes.RETRIEVE_TOKEN
          }
        });

        const expected = cold('--b-', { b: new AuthenticationErrorAction(new Error('Message Error test')) });

        expect(authEffects.retrieveToken$).toBeObservable(expected);
        done();
      });
    });
  });

  describe('logOut$', () => {

    describe('when refresh token succeeded', () => {
      it('should return a LOG_OUT_SUCCESS action in response to a LOG_OUT action', (done) => {

        actions = hot('--a-', { a: { type: AuthActionTypes.LOG_OUT } });

        const expected = cold('--b-', { b: new LogOutSuccessAction() });

        expect(authEffects.logOut$).toBeObservable(expected);
        done();
      });
    });

    describe('when refresh token failed', () => {
      it('should return a REFRESH_TOKEN_ERROR action in response to a LOG_OUT action', (done) => {
        spyOn((authEffects as any).authService, 'logout').and.returnValue(observableThrow(new Error('Message Error test')));

        actions = hot('--a-', { a: { type: AuthActionTypes.LOG_OUT, payload: token } });

        const expected = cold('--b-', { b: new LogOutErrorAction(new Error('Message Error test')) });

        expect(authEffects.logOut$).toBeObservable(expected);
        done();
      });
    });
  });

  describe('retrieveMethods$', () => {

    describe('when retrieve authentication methods succeeded', () => {
      it('should return a RETRIEVE_AUTH_METHODS_SUCCESS action in response to a RETRIEVE_AUTH_METHODS action', () => {
        actions = hot('--a-', { a: { type: AuthActionTypes.RETRIEVE_AUTH_METHODS } });

        const expected = cold('--b-', { b: new RetrieveAuthMethodsSuccessAction(authMethodsMock) });

        expect(authEffects.retrieveMethods$).toBeObservable(expected);
      });
    });

    describe('when retrieve authentication methods failed', () => {
      it('should return a RETRIEVE_AUTH_METHODS_ERROR action in response to a RETRIEVE_AUTH_METHODS action', () => {
        spyOn((authEffects as any).authService, 'retrieveAuthMethodsFromAuthStatus').and.returnValue(observableThrow(''));

        actions = hot('--a-', { a: { type: AuthActionTypes.RETRIEVE_AUTH_METHODS } });

        const expected = cold('--b-', { b: new RetrieveAuthMethodsErrorAction() });

        expect(authEffects.retrieveMethods$).toBeObservable(expected);
      });
    });
  });

  describe('clearInvalidTokenOnRehydrate$', () => {

    describe('when auth authenticated is false', () => {
      it('should not call removeToken method', (done) => {
        initialState = {
          core: {
            auth: {
              authenticated: true,
              loaded: true,
              loading: false,
              authMethods: []
            }
          }
        };
        store.setState(initialState);
        actions = hot('--a-', { a: { type: StoreActionTypes.REHYDRATE } });
        spyOn(authServiceStub, 'removeToken');

        authEffects.clearInvalidTokenOnRehydrate$.subscribe(() => {
          expect(authServiceStub.removeToken).not.toHaveBeenCalled();
        });
        done();
      });
    });

    describe('when auth authenticated is true', () => {
      it('should call removeToken method', (done) => {
        initialState = {
          core: {
            auth: {
              authenticated: false,
              loaded: true,
              loading: false,
              authMethods: []
            }
          }
        };
        store.setState(initialState);
        actions = hot('--a-', { a: { type: StoreActionTypes.REHYDRATE } });
        spyOn(authServiceStub, 'removeToken');

        authEffects.clearInvalidTokenOnRehydrate$.pipe(take(1)).subscribe(() => {
          expect(authServiceStub.removeToken).toHaveBeenCalled();
        });
        done();
      });
    });
  });

  describe('refreshTokenAndRedirect$', () => {

    describe('when refresh token and redirect succeeded', () => {
      it('should return a REFRESH_TOKEN_AND_REDIRECT_SUCCESS action in response to a REFRESH_TOKEN_AND_REDIRECT action', (done) => {

        actions = hot('--a-', { a: { type: AuthActionTypes.REFRESH_TOKEN_AND_REDIRECT, payload: {token, redirectUrl} } });

        const expected = cold('--b-', { b: new RefreshTokenAndRedirectSuccessAction(token, redirectUrl) });

        expect(authEffects.refreshTokenAndRedirect$).toBeObservable(expected);
        done();
      });
    });

    describe('when refresh token failed', () => {
      it('should return a REFRESH_TOKEN_AND_REDIRECT_ERROR action in response to a REFRESH_TOKEN_AND_REDIRECT action', (done) => {
        spyOn((authEffects as any).authService, 'refreshAuthenticationToken').and.returnValue(observableThrow(''));

        actions = hot('--a-', { a: { type: AuthActionTypes.REFRESH_TOKEN_AND_REDIRECT, payload: {token, redirectUrl} } });

        const expected = cold('--b-', { b: new RefreshTokenAndRedirectErrorAction() });

        expect(authEffects.refreshTokenAndRedirect$).toBeObservable(expected);
        done();
      });
    });

  });

  describe('refreshTokenAndRedirectSuccess$', () => {
    it('should replace token and redirect in response to a REFRESH_TOKEN_AND_REDIRECT_SUCCESS action', (done) => {

      actions = hot('--a-', { a: { type: AuthActionTypes.REFRESH_TOKEN_AND_REDIRECT_SUCCESS, payload: {token, redirectUrl} } });

      spyOn(authServiceStub, 'replaceToken');
      spyOn(routerStub, 'navigateByUrl');

      authEffects.refreshTokenAndRedirectSuccess$.pipe(take(1)).subscribe(() => {
        expect(authServiceStub.replaceToken).toHaveBeenCalledWith(token);
        expect(routerStub.navigateByUrl).toHaveBeenCalledWith(redirectUrl);
      });
      done();
    });
  });

  describe('invalidateAuthorizationsRequestCache$', () => {
    it('should call invalidateAuthorizationsRequestCache method in response to a REHYDRATE action', (done) => {
      actions = hot('--a-|', { a: { type: StoreActionTypes.REHYDRATE } });

      authEffects.invalidateAuthorizationsRequestCache$.subscribe(() => {
        expect((authEffects as  any).authorizationsService.invalidateAuthorizationsRequestCache).toHaveBeenCalled();
      });

      done();
    });
  });
});
