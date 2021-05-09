import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  @Input() mode = 'inline-add';
  @Output() selected: EventEmitter<String>= new EventEmitter();
  
  roles = [ 'Role 1', 'Role 2', 'Role 3', 'Role 4' ];
  
  constructor() { }

  ngOnInit(): void {
  }

}
