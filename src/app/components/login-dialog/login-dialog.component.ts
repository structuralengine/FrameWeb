import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserInfoService } from '../../providers/user-info.service';
import { AuthService } from '../../core/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {

  loginUserName: string;
  loginPassword: string;
  rememberCheck: boolean;
  loginError: boolean;
  errorMessage: string;
  connecting: boolean;
  loggedIn: boolean;

  constructor(public activeModal: NgbActiveModal,
    private http: HttpClient,
    private user: UserInfoService,
    public auth: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,) {
      this.loginError = false;
      this.connecting = false;
    }

  ngOnInit() {
    //　エンターキーでログイン可能にする。
    //　不要な場合は以下の処理を消してください。
    document.body.onkeydown = (e)=> {
      if (e.key === 'Enter') {
        this.onClick();
      }
    }

    this.afAuth.signOut().then(() => {
      this.router.navigate(['/']);
  });
  }

  onClick() {

    this.connecting = true;

    const url = 'https://structuralengine.com/my-module/get_points_balance.php?id=' + this.loginUserName + '&ps=' + this.loginPassword;

    this.http.get(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    })
      .subscribe(
        response => {
          // 通信成功時の処理（成功コールバック）
          const response_text = response;
          if ('error' in response_text) {
            this.errorMessage = response_text['error'];
            this.loginError = true;
            this.connecting = false;

          } else {
            this.user.loginUserName = this.loginUserName;
            this.user.loginPassword = this.loginPassword;
            this.user.user_id = response_text['user_id'];
            this.user.purchase_value = response_text['purchase_value'];
            this.user.loggedIn = true;
            this.activeModal.close('Submit');
          }
        },
        error => {
          // 通信失敗時の処理（失敗コールバック）
          this.errorMessage = error.statusText;
          this.loginError = true;
          this.connecting = false;
        }
    );
  }

  login() {
    this.auth.googleLogin();
    this.activeModal.close('Submit');
    this.user.loggedIn = true;
    // this.user.loggedIn = true;
  }

  logout() {
    this.auth.signOut();
  }
}
