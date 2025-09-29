// https://localhost:44303/HangfireTest,"2025-09-20T09:30:00.0Z"

import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-test',
  template: `
    <div style="padding: 20px;">
      <button (click)="callEndpoint()" class="btn btn-primary">Call Endpoint</button>
    </div>
  `,
  styles: [`
    .btn {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
    }
    .btn:hover {
      background-color: #0056b3;
    }
  `]
})
export class TestComponent {
  private apiUrl = 'https://localhost:44303/Attendance/TakeLeaveByAdmin';
  //private payload = new Date("2025-09-20T09:30:00.0Z").toISOString();
  private dateObject = {
  "employeeId": "ad8414f7-f093-4172-94cb-0c968fa787e9",
  "shiftId": 17,
  "leaveDate": "2025-09-19T14:47:02.847Z"
  };
  constructor(private http: HttpClient) {}

  callEndpoint(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post(this.apiUrl, JSON.stringify(this.dateObject), { headers })
      .subscribe({
        next: (response) => {
          console.log('API call successful:',response);
          alert('Endpoint called successfully!');
        },
        error: (error) => {
          console.error('API call failed:', error);
          alert('Failed to call endpoint: ' + error.message);
        }
      });
  }
}
