import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Set } from 'src/app/redux/actions';
import { State } from 'src/app/redux/state';
import * as AppSelectors from '../../redux/selectors';
import Speech from 'speak-tts'

@Component({
  selector: 'app-audio',
  templateUrl: './audio.component.html',
  styleUrls: ['./audio.component.scss']
})
export class AudioComponent implements OnInit {
  @Input() mode = 'toggle';

  audioEnabled = false;
  speechCtrl: any;
  constructor(private store: Store<State>) {
    store.select(AppSelectors.selectAudioEnabled).subscribe(status => {
      this.audioEnabled = status;
    })
  }

  ngOnInit(): void {}

  toggleAudio() {
    if(this.audioEnabled == false){
      try{
        this.speechCtrl = new Speech();
        if(this.speechCtrl.hasBrowserSupport()) { // returns a boolean
          console.log("speech synthesis supported")
          this.speechCtrl.init().then((data) => {
              // The "data" object contains the list of available voices and the voice synthesis params
              console.log("Speech is ready, voices are available", data)
          }).catch(e => {
              console.error("An error occured while initializing : ", e)
          });
          this.audioEnabled = true;
        }else{
          this.audioEnabled = false;
        }
      }catch(error){
        this.audioEnabled = false;
        console.log("speech synthesis is not supported")
      }
    }else{
      this.audioEnabled = false;
      this.speechCtrl = null;
    }

    this.store.dispatch(new Set({
      state: 'audioEnabled',
      data: this.audioEnabled
    }));
  }

  playAudio() {}

}
