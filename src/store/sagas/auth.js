import { delay } from 'redux-saga';
import { put, call } from 'redux-saga/effects';
import axios from 'axios';
import * as actions from '../actions/index';

export function* logoutSaga(action) {                           //generators - next gen JS
    yield call([localStorage, 'removeItem'], 'token');          //call - easy for testing
    yield call([localStorage, 'removeItem'], 'expirationDate'); //yield - wait till finished
    yield call([localStorage, 'removeItem'], 'userId');
    yield put(actions.logoutSucceed());
}

export function* checkAuthTimeoutSaga(action) {
    yield delay(action.expirationTime * 1000);
    yield put(actions.logout());
}

export function* authUserSaga(action) {
    yield put(actions.authStart());
    const authData = {
        email: action.email,
        password: action.password,
        returnSecureToken: true
    }
    let url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyD03lznCUikDRBEl6S_xf5XaL-Lh_xlRG4';
    if(!action.isSignup) {
        url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyD03lznCUikDRBEl6S_xf5XaL-Lh_xlRG4';
    }
    try {
        const response = yield axios.post(url, authData);
        const expirationDate = new Date(new Date().getTime() + response.data.expiresIn * 1000);
        yield localStorage.setItem('token', response.data.idToken);
        yield localStorage.setItem('expirationDate', expirationDate);
        yield localStorage.setItem('userId', response.data.localId);
        yield put(actions.authSuccess(response.data.idToken, response.data.localId));
        yield put(actions.checkAuthTimeout(response.data.expiresIn));
    }catch (error) {
        yield put(actions.authFail(error.response.data.error));
    }
}

export function* authCheckStateSaga(action) {
    const token = localStorage.getItem('token');
    if(!token){
        yield put(actions.logout());
    }else{
        const expirationDate = new Date(localStorage.getItem('expirationDate'));
        if(expirationDate > new Date()) {
            const userId = localStorage.getItem('userId');
            yield put(actions.authSuccess(token, userId));
            yield put(actions.checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000 ));
        }else{
            yield put(actions.logout());
        }
    }
}