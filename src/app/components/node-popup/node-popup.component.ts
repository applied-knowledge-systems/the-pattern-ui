import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import {State} from '../../redux/state';
import * as AppSelectors from '../../redux/selectors';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Create, Set as SetStoreValue} from 'src/app/redux/actions';
import { LocalStorageService, AppService} from '../../app.service';
@Component({
  selector: 'app-node-popup',
  templateUrl: './node-popup.component.html',
  styleUrls: ['./node-popup.component.scss']
})
export class NodePopupComponent implements OnInit {
  node: any;
  nodeResults$: any;
  term:any;
  constructor(
    public activeModal: NgbActiveModal,
    private localStorageService: LocalStorageService,
    private service: AppService,
    private store: Store<State>
  ) {
    this.store.select(AppSelectors.selectedNode)
      .pipe(distinctUntilChanged())
      .pipe(filter(x => x!=null))
      .subscribe(node => {
        console.log(node)
        this.node = node;
      }
    );
  }

  ngOnInit(): void {

  }

  notImportant(){
    console.log("Node Results");
    console.log("Node "+this.node.id)

    this.store.select(AppSelectors.selectSearchTerm).subscribe(term => {
      console.log(term)
      this.term=term;
    });

    this.service.excludeNode(this.node.id).subscribe(resp => {
      console.log(resp);
    });

          // create search request

    console.log("Call to mark node finished "+this.node.id);
    this.store.dispatch(new Create({
      data: { search: this.term },
      state: 'searchResults',
      postProcess: 'map:years',
      route: 'search',
      navigateTo: { route: 'search', query: { q: this.term }}
    }));
    this.activeModal.close()
  }

}
