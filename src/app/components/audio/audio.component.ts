import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Set } from 'src/app/redux/actions';
import { State } from 'src/app/redux/state';
import * as AppSelectors from '../../redux/selectors';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit {
  @Input() mode = 'toggle';
  audioEnabled = false;
  constructor(private store: Store<State>) {
    store.select(AppSelectors.selectAudioEnabled).subscribe(status => {
      this.audioEnabled = status;
    })
  }

  ngOnInit(): void {

  }

  toggleAudio() {
    this.store.dispatch(new Set({
      state: 'audioEnabled',
      data: !this.audioEnabled
    }))
  }

  playAudio() {}

}
