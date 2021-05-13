import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { Create, Set } from 'src/app/redux/actions';
import { State } from 'src/app/redux/state';
import * as AppSelectors from 'src/app/redux/selectors';
import { AudioService } from '../audio/audio.component';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss']
})
export class SearchFormComponent implements OnInit {

  @Input() mode: string;
  searchForm: FormGroup;
  currentRoute: String;
  roleUri: string
  
  get term() { return this.searchForm.get('term'); }

  samples = [
    "Effectiveness of case isolation/isolation of exposed individuals (i.e. quarantine)",
    "Effectiveness of community contact reduction",
    "Effectiveness of inter/inner travel restriction",
    "Effectiveness of school distancing",
    "Effectiveness of workplace distancing",
    "Effectiveness of a multifactorial strategy prevent secondary transmission",
    "Seasonality of transmission",
    "How does temperature and humidity affect the transmission of 2019-nCoV?",
    "Significant changes in transmissibility in changing seasons?",
    "Effectiveness of personal protective equipment (PPE)"
  ]
  

  constructor(
    private store: Store<State>, 
    fb: FormBuilder, route: ActivatedRoute,
    private audioService: AudioService
  ) {
    this.searchForm = fb.group({
      'term': ['', Validators.required]
    });

    route.queryParams.pipe(filter(x => x['q'] !== null)).subscribe(x => {
      this.term.setValue(x['q']);
      if(x['q'] !== null){
        this.search();
      }
      
    })

    store.select(AppSelectors.selectActiveRole).pipe(filter(x => x!== null)).subscribe(role => {
      this.roleUri = `/view/${role.uri}/${role.id};` || '/start'
    })


  }

  ngOnInit() {
    this.store.select<any>(AppSelectors.selectAnswerResults).subscribe((data) => {
      if(this.audioService.audioEnabled){
        console.log('play audio: ' + data);
        if(data.results!==null && data.results.length>0 && data.results[0].answer != null && data.results[0].answer != undefined){
          this.audioService.playAudio(data.results[0].answer)
        }else{
          this.audioService.playAudio("Sorry, I don't know the answer to your question")
        }
      }
      else{
        console.log("don't play audio");
      }
    });
  }

  search(){
    if(this.searchForm.valid){

      // create search request
      this.store.dispatch(new Create({
        data: { search: this.term.value },
        state: 'searchResults',
        postProcess: 'map:years', 
        route: 'search',
        navigateTo: { route: this.roleUri, query: { q: this.term.value }}
      }));

      // create qa search request
      this.store.dispatch(new Create({
        data: { search: this.term.value },
        state: 'answerResults',
        route: 'qasearch'
      }));

      if(this.audioService.audioEnabled){
        this.audioService.playAudio('Please wait as I retrieve an answer')
      }      

      // set search term
      this.store.dispatch(new Set({
        data: this.term.value,
        state: 'searchTerm'
      }));
    }
  }

  sampleSearch(term){
    this.term.setValue(term);
    this.search()
  }
}
