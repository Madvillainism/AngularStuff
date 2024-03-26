import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent {
  constructor() {}

  myForm!: FormGroup;

  ngOnInit(): void {
    this.myForm = new FormGroup({
      name: new FormControl('Name', Validators.required),
      email: new FormControl('carlos@god', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl('', Validators.required),
    });
  }

  onSubmit() {
    console.log(this.myForm.value);
    alert('Your form data : ' + JSON.stringify(this.myForm.value));
  }
}
