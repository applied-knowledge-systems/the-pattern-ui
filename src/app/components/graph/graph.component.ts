import { Component, OnInit, ViewChild, ElementRef, HostListener, Output, EventEmitter, Input } from '@angular/core';
import SpriteText from 'three-spritetext';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {VRButton} from 'three/examples/jsm/webxr/VRButton';
import { MeshBasicMaterial, SphereGeometry, Mesh, Vector2 } from 'three';
import { Store } from '@ngrx/store';
import { State } from '../../redux/state';
import * as AppSelectors from '../../redux/selectors';
import { filter, distinctUntilChanged, map } from 'rxjs/operators';
import { Read, Set as SetStoreValue } from 'src/app/redux/actions.js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EdgePopupComponent } from '../edge-popup/edge-popup.component';
import { NodePopupComponent } from '../node-popup/node-popup.component';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';

declare var ForceGraph3D;

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit {
  emptySearch = true;
  @ViewChild('graph', { static: true }) graph: ElementRef;
  Graph: any;
  gData: any;
  mode = '3D';
  canvasHeight: number;
  canvasWidth: number;
  sidebarOpen = false;

  @Output() graphClicked: EventEmitter<any> = new EventEmitter();
  @Input() width;

  threeScene: any;
  threeRenderer: any;
  threeControls: any;
  threeCamera: any;

  loading$;
  loadingState$;
  
  constructor(private store: Store<State>, private modalService: NgbModal) {}

  ngOnInit() {
    this.canvasHeight = window.innerHeight - 128;
    this.canvasWidth = window.innerWidth;
    this.store.select<any>(AppSelectors.selectSearchResults)
      .pipe(filter(x => x!=null))
      .subscribe((results) => {
        this.emptySearch = false;
        this.gData = results;
        this.initializeGraph();
      }
    );

    this.loading$ = this.store.select(AppSelectors.selectIsLoading)
    this.loadingState$ = this.store.select(AppSelectors.selectIsLoadingState)

    this.store.select(AppSelectors.selectUX)
      .pipe(map(x => x.sidebar))
      .pipe(distinctUntilChanged())
      .pipe(filter(x => x!=null))
      .subscribe(open => {
        console.log(open)
        if(open){
          this.canvasWidth = window.innerWidth - 320;
        }else{
          this.canvasWidth = window.innerWidth;
        }
        
        this.Graph.width(this.canvasWidth)
      }
    );
  }

  initializeGraph() {
    let highlightNodes = new Set();
    let highlightLinks = new Set();
    this.Graph = ForceGraph3D();
    this.Graph(this.graph.nativeElement)
      .linkWidth(link => highlightLinks.has(link) ? 4 : 1)
      .linkDirectionalParticles(link => highlightLinks.has(link) ? 4 : 0)
      .linkDirectionalParticleWidth(4)
      .nodeAutoColorBy('rank')
      .nodeThreeObject(node => {
        // use a sphere as a drag handle
        const obj = new Mesh(
          new SphereGeometry(10),
          new MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0 })
        );

        // add text sprite as child
        const sprite = new SpriteText(node.name);
        sprite.color = node.color;
        sprite.textHeight = 8;
        obj.add(sprite);

        return obj;
      })
      .linkHoverPrecision(5)
      .onLinkHover(link => {
        highlightNodes.clear();
        highlightLinks.clear();

        if (link) {
          highlightLinks.add(link);
          highlightNodes.add(link.source);
          highlightNodes.add(link.target);
        }

        this.updateHighlight();
      })
      .backgroundColor('#37474f')
      .height(this.canvasHeight)
      .width(this.canvasWidth)
      // .graphData(this.gData);

    this.Graph.onNodeClick(this.onNodeClick.bind(this));
    this.Graph.onLinkClick(this.onLinkClick.bind(this));

    this.threeScene = this.Graph.scene();
    this.threeRenderer = this.Graph.renderer();
    this.threeControls = this.Graph.controls();
    this.threeCamera = this.Graph.camera();

    this.addEdgeDetailsContainer();
    // this.postProcessing();

    this.initXR()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.canvasHeight = window.innerHeight - 128;
    this.canvasWidth = window.innerWidth;
  }

  onNodeClick(node, event){
    this.onGraphClick({ type: 'node', data: node })
  }

  onLinkClick(node, event){
    this.onGraphClick({ type: 'edge', data: node });
  }

  onLinkHover(node, event){
    this.onGraphClick({ type: 'edge', data: node });
  }

  updateHighlight() {
    // trigger update of highlighted objects in scene
    this.Graph
      .nodeColor(this.Graph.nodeColor())
      .linkWidth(this.Graph.linkWidth())
      .linkDirectionalParticles(this.Graph.linkDirectionalParticles());
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
    this.Graph.postProcessingComposer().addPass(bloomPass);
  }

  onGraphClick(event){
    switch(event.type){
      case 'node':
        this.store.dispatch(new SetStoreValue({
          data: event.data,
          state: 'selectedNode'
        }));
        this.showNodeDetails()
        break;

      case 'edge':
        this.store.dispatch(new Read({
          state: 'edgeResults',
          route: `edge/edges:${event.data.source.id}:${event.data.target.id}`
        }));
        // this.store.dispatch(new SetStoreValue({
        //   data: true,
        //   state: 'sidebar'
        // }));

        this.store.dispatch(new SetStoreValue({
          data: event.data,
          state: 'selected'
        }));
        this.showEdgeDetails()
        break;

      default:
        break;
    }
  }

  initXR(){
    this.threeRenderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(this.threeRenderer));
    this.threeRenderer.setAnimationLoop(() => {
      ThreeMeshUI.update();
      this.threeRenderer.render(this.threeScene, this.threeCamera);
    });
  }

  showNodeDetails() {
    const modalRef = this.modalService.open(NodePopupComponent, { size: 'sm', scrollable: true });
  }

  showEdgeDetails() {
    const modalRef = this.modalService.open(EdgePopupComponent, { size: 'xl', scrollable: true });
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
