import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { of, } from 'rxjs';
import { tap, map, catchError, mergeMap } from 'rxjs/operators';

import * as AppActions from './actions';
import { ICreateSuccess, IReadSuccess, IUpdateSuccess, IDeleteSuccess, IAuthSuccess, ISignupSuccess } from './interfaces';
import { NotificationsService } from 'angular2-notifications';
import { DataService } from '../services/data.service';
import { Store } from '@ngrx/store';
import { State } from './state';
import { SearchFormComponent } from '../components/search-form/search-form.component';
@Injectable()
export class AppEffects {
    @Effect() create$;
    @Effect({ dispatch: false }) createSuccess$;
    @Effect({ dispatch: false }) createFailed$;

    @Effect() read$;
    @Effect({ dispatch: false }) readSuccess$;
    @Effect({ dispatch: false }) readFailed$;

    @Effect() update$;
    @Effect({ dispatch: false }) updateSuccess$;
    @Effect({ dispatch: false }) updateFailed$;

    @Effect() delete$;
    @Effect({ dispatch: false }) deleteSuccess$;
    @Effect({ dispatch: false }) deleteFailed$;

    constructor(
        private actions$: Actions,
        private router: Router,
        private service: DataService,
        private notify: NotificationsService,
        private store: Store<State>
    ) {
        this.create$ = this.actions$.pipe(
            ofType(AppActions.CREATE),
            mergeMap((action: AppActions.Create) =>
                this.service.create(action.payload).pipe(
                    map((results: ICreateSuccess) => new AppActions.CreateSuccess(results)),
                    catchError(err => of(new AppActions.CreateFailure(err))))
            )
        );

        // success
        this.createSuccess$ = this.actions$.pipe(
            ofType(AppActions.CREATE_SUCCESS),
            map((action: AppActions.CreateSuccess) => {
                if(action.payload.notify){
                    this.notify.success('Congratulations', action.payload.message);
                }

                if(action.payload.navigate){
                    this.router.navigate([action.payload.navigateTo.route], { queryParams: action.payload.navigateTo.query });
                }

                if(action.payload.postProcessStatus){
                    switch(action.payload.postProcess){
                        case 'map:years':
                            let years = action.payload.data.years.sort();
                            const min = years.reduce((p, v) =>  ( p < v ? p : v ));
                            const max = years.reduce((p, v) => ( p > v ? p : v ));
                            const mid = Math.ceil(years.length / 2);
                            const median = years.length % 2 == 0 ? (years[mid] + years[mid - 1]) / 2 : years[mid - 1];

                            this.store.dispatch(new AppActions.Set({
                                data: {
                                    min: min,
                                    max: max,
                                    median: median,
                                    list: action.payload.data.years
                                },
                                state: 'searchYears'
                            }))
                            break;
                        case 'notImportant':
                          // create search request
                          let searchterm=action.payload.data.term;
                          console.log("Post-processing node");
                          console.log(searchterm);
                          this.store.dispatch(new AppActions.Set({
                            data: { search: searchterm},
                            state: 'searchResults',
                            postProcess: 'map:years',
                            route: 'search',
                            navigateTo: { route: 'search', query: { q: searchterm }}
                          }));
                          break;

                        default:
                            break;
                    }
                }
            })
        );

        this.createFailed$ = this.actions$.pipe(
            ofType(AppActions.CREATE_FAILURE),
            map((action: AppActions.CreateFailure) => {
                // investigate on handling server error response messages for forms
                this.notify.error('Oops!', 'An error occured.');
            })
        );

        this.read$ = this.actions$.pipe(
            ofType(AppActions.READ),
            mergeMap((action: AppActions.Read) =>
                this.service.read(action.payload).pipe(
                    map((results: IReadSuccess) => new AppActions.ReadSuccess(results)),
                    catchError(err => of(new AppActions.ReadFailure(err))))
            )
        );

        // success
        this.readSuccess$ = this.actions$.pipe(
            ofType(AppActions.READ_SUCCESS),
            map((action: AppActions.ReadSuccess) => {
                if(action.payload.navigate){
                    this.router.navigate([action.payload.navigateTo.route], { queryParams: action.payload.navigateTo.query });
                }
            })
        );

        this.readFailed$ = this.actions$.pipe(
            ofType(AppActions.READ_FAILURE),
            map((action: AppActions.ReadFailure) => {
                this.notify.error('Oops!', 'An error occured.');
            })
        );

        this.update$ = this.actions$.pipe(
            ofType(AppActions.UPDATE),
            mergeMap((action: AppActions.Update) =>
                this.service.update(action.payload).pipe(
                    map((results: IUpdateSuccess) => new AppActions.UpdateSuccess(results)),
                    catchError(err => of(new AppActions.UpdateFailure(err))))
            )
        );

        // success
        this.updateSuccess$ = this.actions$.pipe(
            ofType(AppActions.UPDATE_SUCCESS),
            map((action: AppActions.UpdateSuccess) => {
                console.log(action.payload);
                if(action.payload.notify){
                    this.notify.success('Yaay', action.payload.message);
                }
                if(action.payload.navigate){
                    this.router.navigate([action.payload.navigateTo.route], { queryParams: action.payload.navigateTo.query});
                }

            })
        );

        this.updateFailed$ = this.actions$.pipe(
            ofType(AppActions.UPDATE_FAILURE),
            map((action: AppActions.UpdateFailure) => {
                this.notify.error('Oops!', 'An error occured.');
            })
        );

        this.delete$ = this.actions$.pipe(
            ofType(AppActions.DELETE),
            mergeMap((action: AppActions.Delete) =>
                this.service.delete(action.payload).pipe(
                    map((results: IDeleteSuccess) => new AppActions.DeleteSuccess(results)),
                    catchError(err => of(new AppActions.DeleteFailure(err))))
            )
        );

        // success
        this.deleteSuccess$ = this.actions$.pipe(
            ofType(AppActions.DELETE_SUCCESS),
            map((action: AppActions.DeleteSuccess) => {
                if(action.payload.navigate){
                    this.router.navigate([action.payload.navigateTo.route], { queryParams: action.payload.navigateTo.query});
                }
                if(action.payload.notify){
                    this.notify.success('Yaay', action.payload.message);
                }
            })
        );

        this.deleteFailed$ = this.actions$.pipe(
            ofType(AppActions.DELETE_FAILURE),
            map((action: AppActions.DeleteFailure) => {
                this.notify.error('Oops!', 'An error occured.');
            })
        );
    }
}
