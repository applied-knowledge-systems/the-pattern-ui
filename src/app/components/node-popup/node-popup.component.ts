import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import {State} from '../../redux/state';
import * as AppSelectors from '../../redux/selectors';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Read } from 'src/app/redux/actions';
import { LocalStorageService } from '../../app.service';
@Component({
  selector: 'app-node-popup',
  templateUrl: './node-popup.component.html',
  styleUrls: ['./node-popup.component.scss']
})
export class NodePopupComponent implements OnInit {
  node: any;
  constructor(
    public activeModal: NgbActiveModal,
    private localStorageService: LocalStorageService,
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
    this.localStorageService.storeOnLocalStorage(this.node.id);
     this.activeModal.close()
  }

}
