import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { isNotEmpty } from '../../shared/empty.util';

import { EditItemDataService } from '../../core/submission/edititem-data.service';
import { followLink } from '../../shared/utils/follow-link-config.model';
import { getAllSucceededRemoteDataPayload, getFirstSucceededRemoteListPayload } from '../../core/shared/operators';
import { EditItem } from '../../core/submission/models/edititem.model';
import { AuthService, LOGIN_ROUTE } from '../../core/auth/auth.service';

/**
 * Prevent unauthorized activating and loading of routes
 * @class AuthenticatedGuard
 */
@Injectable()
export class EditItemRelationsGuard implements CanActivate {

  /**
   * @constructor
   */
  constructor(private router: Router,
              private editItemService: EditItemDataService,
              private authService: AuthService
  ) {
  }

  /**
   * True when user is authenticated
   * UrlTree with redirect to login page when user isn't authenticated
   * @method canActivate
   */
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const url = state.url;
    return this.handleEditable(route.params.id, url);
  }

  /**
   * True when user is authenticated
   * UrlTree with redirect to login page when user isn't authenticated
   * @method canActivateChild
   */
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.canActivate(route, state);
  }

  private handleEditable(itemId: string, url: string): Observable<boolean | UrlTree> {
    // redirect to sign in page if user is not authenticated
    return this.editItemService.findById(itemId + ':none', true, true, followLink('modes')).pipe(
      getAllSucceededRemoteDataPayload(),
      mergeMap((editItem: EditItem) => editItem.modes.pipe(
        getFirstSucceededRemoteListPayload())
      ),
      map((editModes) => {
        if (isNotEmpty(editModes) && editModes.length > 0) {
          return true;
        } else {
          this.authService.setRedirectUrl(url);
          this.authService.removeToken();
          return this.router.createUrlTree([LOGIN_ROUTE]);
        }
      }),
    );
  }
}
