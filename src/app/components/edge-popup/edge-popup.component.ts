import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import * as AppSelectors from '../../redux/selectors';
import {State} from '../../redux/state';

@Component({
  selector: 'app-edge-popup',
  templateUrl: './edge-popup.component.html',
  styleUrls: ['./edge-popup.component.scss']
})
export class EdgePopupComponent implements OnInit {
  edgeData$: any;
  loading$;
  loadingState$;

  constructor(
    public activeModal: NgbActiveModal,
    private store: Store<State>) { }

  ngOnInit(): void {
    this.edgeData$ = this.store.select(AppSelectors.selectEdgeResults);
    this.loading$ = this.store.select(AppSelectors.selectIsLoading)
    this.loadingState$ = this.store.select(AppSelectors.selectIsLoadingState);
  }

}
