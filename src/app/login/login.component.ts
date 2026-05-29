import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {
  myForm!: FormGroup;

  ngOnInit(): void {
    this.myForm = new FormGroup({
      name: new FormControl('Name', Validators.required),
      email: new FormControl('email@hotmail.com', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl('', Validators.required),
      remember: new FormControl(false),
    });
  }

  onSubmit() {
    console.log(this.myForm.value);
    alert('Your registered data : ' + JSON.stringify(this.myForm.value));
  }
}
