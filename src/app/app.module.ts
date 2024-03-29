import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { IcommitModule } from './modules/icommit.module';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB9G9ya5lo5PETRF2c0EngDFY71kkiwqME',
  authDomain: 'icommit-firebase.firebaseapp.com',
  projectId: 'icommit-firebase',
  storageBucket: 'icommit-firebase.appspot.com',
  messagingSenderId: '36911459689',
  appId: '1:36911459689:web:e94f1e6bd77161758ba1f8',
};
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    IcommitModule,
    SharedModule,
    BrowserAnimationsModule,
    // AngularSignaturePadModule,
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
