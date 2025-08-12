import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "../../../enviroments/environment"
import { ChangePassword, UserProfile, ProfileResponse } from "../models/profile"

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private readonly API_URL = `${environment.apiUrl}/Account`

  constructor(private http: HttpClient) {}

  getUserProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API_URL}/GetSpecificUserData/${userId}`)
  }

  updateProfile(profile: UserProfile): Observable<string> {
    return this.http.put(`${this.API_URL}/EditProfile`, profile, { responseType: "text",})
  }

  changePassword(changePasswordData: ChangePassword): Observable<string> {
    return this.http.post(`${this.API_URL}/ChangePassword`, changePasswordData, { responseType: "text" })
  }
}
