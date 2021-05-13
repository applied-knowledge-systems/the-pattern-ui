import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import {State} from '../../redux/state';
import { Create, Read, Set as SetStoreValue} from 'src/app/redux/actions';
import { filter, distinctUntilChanged, map } from 'rxjs/operators';
import { AppService} from '../../app.service';
import * as AppSelectors from '../../redux/selectors';

@Component({
  selector: 'app-nurse-view',
  templateUrl: './nurse-view.component.html',
  styleUrls: ['./nurse-view.component.scss']
})
export class NurseViewComponent implements OnInit {
  term:any;
  QAResults$: any;
  constructor(
    private service: AppService,
    private store: Store<State>
  ) {
    this.store.select(AppSelectors.selectSearchTerm).subscribe(term => {
      console.log(term)
      this.term=term;
    });

  }

  ngOnInit(): void {

    this.term="Effectiveness of inner travel restriction"
    this.store.dispatch(new Create({
      data: { search: this.term},
      state: 'QAResults',
      route: 'qasearch'
    }));

    this.QAResults$ = this.store.select<any>(AppSelectors.selectQAResults).subscribe((results) => {
      this.QAResults$=results;
      console.log(this.QAResults$)
    });
    console.log("Check QA results");

  }

}
