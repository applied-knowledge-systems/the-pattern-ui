import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { filter } from "rxjs/operators";
import { State } from "src/app/redux/state";
import { Set } from '../../redux/actions';
@Component({
  selector: "app-roles",
  templateUrl: "./roles.component.html",
  styleUrls: ["./roles.component.scss"],
})
export class RolesComponent implements OnInit {
  @Input() mode = "inline-add";
  @Output() selected: EventEmitter<String> = new EventEmitter();

  roles = [
    {
      label: "Nurse",
      uri: "nurse",
      audioEnabled: true,
      threeView: '3D', // 3D, VR
      controller: 'LeapMotionCtrl' // LeapMotionCtrl, VRCtrcl, TrackballCtrl
    },
    {
      label: "Medical student",
      uri: "medical-student",
      audioEnabled: false,
      threeView: 'VR', // 3D, VR
      controller: 'VRCtrcl'
    },
  ];

  selectedRole: any = null;
  selectedRoleId: number;

  constructor(
    route: ActivatedRoute, 
    private router: Router,
    private store: Store<State>) {
    route.params.pipe(filter((x) => x["role"] !== undefined )).subscribe((params) => {
      this.selectedRole = params["role"];
      this.selectedRoleId = parseInt(params["id"]);
      console.log(this.selectedRoleId)
      this.store.dispatch(new Set({
        data: this.roles[this.selectedRoleId].audioEnabled,
        state: 'audioEnabled'
      }));
      
    });

    route.data.subscribe((data) => {
      this.mode = data["mode"] || "inline-add";
    });
  }

  ngOnInit(): void {}

  selectRole(id: number) {
    this.store.dispatch(new Set({
      data: this.roles[id],
      state: 'activeRole'
    }))
    this.router.navigate([`/view/${this.roles[id].uri}/${id}`]);
  }
}
