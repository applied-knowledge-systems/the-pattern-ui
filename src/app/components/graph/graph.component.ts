import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {VRButton} from 'three/examples/jsm/webxr/VRButton';
import { Store } from '@ngrx/store';
import { State } from '../../redux/state';
import * as AppSelectors from '../../redux/selectors';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';
import { GraphService } from 'src/app/services/graph.service';


@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {
  emptySearch = true;
  mode = '3D';
  canvasHeight: number;
  canvasWidth: number;

  @ViewChild('graph', { static: true }) graph: ElementRef;
  @Input() renderer: string
  @Input() controller: string

  threeScene: any;
  threeRenderer: any;
  threeControls: any;
  threeCamera: any;

  loading$;
  loadingState$;
  
  constructor(
    private store: Store<State>, 
    private graphService: GraphService
  ) { }

  ngOnInit() {
    this.canvasHeight = window.innerHeight - 128;
    this.canvasWidth = window.innerWidth;
    this.store.select<any>(AppSelectors.selectSearchResults)
      .pipe(
        filter(x => x!=null),
        distinctUntilChanged()
      ).subscribe((results) => {
        this.emptySearch = false;
        this.graphService.gData = results;
        this.graphService.populateGraph(this.graph.nativeElement, this.canvasHeight, this.canvasWidth);
      }
    );

    this.loading$ = this.store.select(AppSelectors.selectIsLoading)
    this.loadingState$ = this.store.select(AppSelectors.selectIsLoadingState)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.canvasHeight = window.innerHeight - 128;
    this.canvasWidth = window.innerWidth;
    this.graphService.populateGraph(this.graph.nativeElement, this.canvasHeight, this.canvasHeight)
  }

  postProcessing(){
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 5;
    bloomPass.radius = 0;
    // const strength = 0.7;
    // const radius = 0.2;
    // const threshold = 0;
    // const bloomPass = new UnrealBloomPass(new Vector2(128, 128), strength, radius, threshold);
    // this.Graph.postProcessingComposer().addPass(bloomPass);
  }

  initXR(){
    if(this.renderer == 'XR'){
      this.threeRenderer.xr.enabled = true;
      document.body.appendChild(VRButton.createButton(this.threeRenderer));
      this.threeRenderer.setAnimationLoop(() => {
        this.threeRenderer.render(this.threeScene, this.threeCamera)
      });
    }
    
  }

  addEdgeDetailsContainer(){
    console.log('edge')
    const container = new ThreeMeshUI.Block({
      width: 1.2,
      height: 0.7,
      padding: 0.2,
      fontFamily: '../../../assets/Roboto-msdf.json',
      fontTexture: '.../../../assets/Roboto-msdf.png',
     });

    const text = new ThreeMeshUI.Text({
      content: "Some text to be displayed"
    });

    container.position.set( 0, 1, -1.8 );
    container.rotation.x = 0;
     
    container.add( text );
    this.threeScene.add( container );
  }

  addRoomToScence(){
    // const room = new THREE.LineSegments(
    //   new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
    //   new THREE.LineBasicMaterial( { color: 0x808080 } )
    // );
  
    // this.threeScene.add( room );
  }

}
