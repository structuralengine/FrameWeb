import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Http, Headers } from '@angular/http';
import { UserInfoService } from '../../providers/user-info.service';


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

  constructor(public activeModal: NgbActiveModal,
    private http: Http,
    private user: UserInfoService) {
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
  }

  onClick() {

    this.connecting = true;

    const url = 'https://structuralengine.com/my-module/get_points_balance.php?id=' + this.loginUserName + '&ps=' + this.loginPassword;

    this.http.get(url, {
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      })
    })
      .subscribe(
        response => {
          // 通信成功時の処理（成功コールバック）
          const response_text = JSON.parse(response.text());
          if ('error' in response_text) {
            this.errorMessage = response_text.error;
            this.loginError = true;
            this.connecting = false;

          } else {
            this.user.loginUserName = this.loginUserName;
            this.user.loginPassword = this.loginPassword;
            this.user.user_id = response_text.user_id;
            this.user.purchase_value = response_text.purchase_value;
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
}
