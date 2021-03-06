import {Component, ViewContainerRef, HostListener, OnInit} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {SlimLoadingBarService} from 'ng2-slim-loading-bar';
import * as _ from 'lodash';
import {ConfirmComponent} from '../widgets/dialogs/confirm/confirm.component';
import {AppService} from '../app.service';
import {MdDialog, MdDialogConfig, MdDialogRef} from '@angular/material';
import {CreateAeComponent} from '../widgets/dialogs/create-ae/create-ae.component';
import {DevicesService} from '../devices/devices.service';
import {WindowRefService} from "../helpers/window-ref.service";
import {UserConfigService} from "./user-config.service";
import {HttpErrorHandler} from "../helpers/http-error-handler";
import {J4careHttpService} from "../helpers/j4care-http.service";

@Component({
  selector: 'app-user-config',
  templateUrl: './user-config.component.html'
})
export class UserConfigComponent implements OnInit{
    _ = _;
    userList;
    advancedConfig;    
    aesfilter = '';
    filter = {
        dicomDeviceName: undefined,
        dicomAETitle: undefined,
        dicomDescription: undefined,
        dicomAssociationInitiator: undefined,
        dicomAssociationAcceptor: undefined,
        dicomApplicationCluster: undefined,
    };
    moreAes = {
        limit: 30,
        start: 0,
        loaderActive: false
    };
    devices;
    dialogRef: MdDialogRef<any>;

    constructor(
      public $http:J4careHttpService,
      public cfpLoadingBar: SlimLoadingBarService,
      public mainservice: AppService,
      public viewContainerRef: ViewContainerRef ,
      public dialog: MdDialog,
      public config: MdDialogConfig,
      public service: UserConfigService,
      public httpErrorHandler:HttpErrorHandler
    ){}
    ngOnInit(){
        this.initCheck(10);
    }
    initCheck(retries){
        let $this = this;
        if(_.hasIn(this.mainservice,"global.authentication")  || (_.hasIn(this.mainservice,"global.notSecure") && this.mainservice.global.notSecure)){
            this.init();
        }else{
            if (retries){
                setTimeout(()=>{
                    $this.initCheck(retries-1);
                },20);
            }else{
                this.init();
            }
        }
    }
    init(){
      this.getUserList();
    }

    getKeys(obj){
        console.log('getkeys obj', obj);
        if (obj){
            if (_.isArray(obj)){
                return obj;
            }else{
                return Object.keys(obj);
            }
        }else{
            return [];
        }
    }

    @HostListener('window:scroll', ['$event'])
    loadMoreAesOnScroll(event) {
        // console.debug("Scroll Event", document.body.scrollTop);
        // see András Szepesházi's comment below
        // console.debug("Scroll Event", window.pageYOffset );
        // console.log("scrollevent",event);
        // $(window).scroll(function() {
        let hT = ($('.load_more').offset()) ? $('.load_more').offset().top : 0,
            hH = $('.load_more').outerHeight(),
            wH = $(window).height(),
            wS = window.pageYOffset;
        // console.log("hT",hT);
        // console.log("hH",hH);
        // console.log("wH",wH);
        // console.log("wS",wS);
        if (wS > (hT + hH - wH)){
            this.loadMoreAes();
        }
        // });
    }
    loadMoreAes(){
        this.moreAes.loaderActive = true;
        this.moreAes.limit += 20;
        // if(this.moreAes.limit > 50){
            // this.moreAes.start +=20;
        // }
        this.moreAes.loaderActive = false;
    }
    searchAes(){
        this.cfpLoadingBar.start();
        let urlParam = this.mainservice.param(this.filter);
        if (urlParam){
            urlParam = '?' + urlParam;
        }
        let $this = this;
        this.$http.get('../aes' + urlParam)
            .map(res => {let resjson; try{ let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/"); if(pattern.exec(res.url)){ WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";} resjson = res.json(); }catch (e){ resjson = [];} return resjson;})
            .subscribe((response) => {
                //$this.aes = response;
                $this.cfpLoadingBar.complete();
            }, (err) => {
                // vex.dialog.alert("Error loading aes, please reload the page and try again!");
                $this.cfpLoadingBar.complete();
            });
    };
    confirm(confirmparameters){
        this.config.viewContainerRef = this.viewContainerRef;
        this.dialogRef = this.dialog.open(ConfirmComponent, {
            height: 'auto',
            width: '500px'
        });
        this.dialogRef.componentInstance.parameters = confirmparameters;
        return this.dialogRef.afterClosed();
    };
    clearForm(){
        let $this = this;
        _.forEach($this.filter, (m, i) => {
            $this.filter[i] = '';
        });
        this.searchAes();
    };
    echoAe(ae){
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let select: any = [];
        // _.forEach(this.aets, (m, i) => {
        //     select.push({
        //         title: m.dicomAETitle,
        //         value: m.dicomAETitle,
        //         label: m.dicomAETitle
        //     });
        // });
        let parameters: any = {
            content: 'Select one AET:',
            select: select,
            // result: {select: this.aets[0].dicomAETitle},
            bodytext: 'Remote AET: <b>' + ae + '</b>',
            saveButton: 'ECHO',
            cssClass: 'echodialog'
        };
        let $this = this;
        this.confirm(parameters).subscribe(result => {
            if (result){
                console.log('result', result);
                console.log('result', parameters.result);
                $this.cfpLoadingBar.start();
                $this.$http.post(
                    '../aets/' + parameters.result.select + '/dimse/' + ae,
                    {}
                ).map(res => {let resjson; try{ let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/"); if(pattern.exec(res.url)){ WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";} resjson = res.json(); }catch (e){ resjson = [];} return resjson;})
                    .subscribe((response) => {
                        console.log('response', response);
                        $this.cfpLoadingBar.complete();
                        if (_.hasIn(response, 'errorMessage') && response.errorMessage != '') {
                            $this.mainservice.setMessage({
                                'title': 'Error ',
                                'text': response.errorMessage,
                                'status': 'error'
                            });
                        } else {

                            $this.mainservice.setMessage({
                                'title': 'Info',
                                'text': 'Echo successfully accomplished!<br>- Connection time: ' +
                                response.connectionTime +
                                ' ms<br/>- Echo time: ' +
                                response.echoTime +
                                ' ms<br/>- Release time: ' +
                                response.releaseTime + ' ms',
                                'status': 'info'
                            });
                        }
                    }, err => {
                        $this.cfpLoadingBar.complete();
                        $this.httpErrorHandler.handleError(err);
                    });
            }
        });
    };
    deleteAE(device, ae){
        let parameters: any = {
            content: `Are you sure you want to delete from <b>${device}</b> the AE: <b>${ae}</b>?`,
            input: {
                name: 'deletedevice',
                type: 'checkbox',
                checkboxtext: 'Delete also the device <b>' + device + '</b>'
            },
            result: {input: false},
            saveButton: 'DELETE',
            cssClass: 'deleteaet'
        };
        console.log('parameters', parameters);
        let $this = this;
        this.confirm(parameters).subscribe(result => {
            if (result){
                console.log('in clearae', result);
                if (result.input === true){
                    $this.$http.delete('../devices/' + device).subscribe((res) => {
                            console.log('res', res);
                            $this.mainservice.setMessage({
                                'title': 'Info',
                                'text': 'Device deleted successfully!',
                                'status': 'info'
                            });
                            $this.$http.post('../ctrl/reload', {}).subscribe((res) => {
                                $this.mainservice.setMessage({
                                    'title': 'Info',
                                    'text': 'Archive reloaded successfully!',
                                    'status': 'info'
                                });
                                $this.searchAes();
                            }, (error) => {
                                console.warn('Reloading the Archive failed');
                            });

                        },
                        (err) => {
                            $this.httpErrorHandler.handleError(err);
                        });
                }else{
                    $this.$http.get('../devices/' + device)
                        .map(res => {let resjson; try{ let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/"); if(pattern.exec(res.url)){ WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";} resjson = res.json(); }catch (e){ resjson = [];} return resjson;})
                        .subscribe(
                            (res) => {
                                console.log('res', res);
                                let deviceObject = res;
                                //Remove ae from device and save it back
                                _.forEach(deviceObject.dicomNetworkAE , (m, i) => {
                                    console.log('m', m);
                                    console.log('i', i);
                                    if (m && m.dicomAETitle === ae){
                                        deviceObject.dicomNetworkAE.splice(i, 1);
                                    }
                                });
                                console.log('equal', _.isEqual(res, deviceObject));
                                console.log('deviceObj', deviceObject);
                                $this.$http.put('../devices/' + device, deviceObject)
                                    .subscribe((resdev) => {
                                            console.log('resdev', resdev);
                                            $this.mainservice.setMessage({
                                                'title': 'Info',
                                                'text': 'Ae removed from device successfully!',
                                                'status': 'info'
                                            });
                                            $this.$http.post('../ctrl/reload', {}).subscribe((res) => {
                                                $this.mainservice.setMessage({
                                                    'title': 'Info',
                                                    'text': 'Archive reloaded successfully!',
                                                    'status': 'info'
                                                });
                                                $this.searchAes();
                                            });
                                        },
                                        (err) => {
                                            console.log('err', err);
                                            $this.mainservice.setMessage({
                                                'title': 'error',
                                                'text': 'Error, the AE was not removed from device!',
                                                'status': 'error'
                                            });
                                        });
                            },
                            (err) => {
                                $this.mainservice.setMessage({
                                    'title': 'error',
                                    'text': 'Error getting device ' + device,
                                    'status': 'error'
                                });
                            }
                        );
                }
            }
        });
    };
    createAe(){
        this.cfpLoadingBar.start();
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let dicomconn = [];
        let newAetModel = {
            dicomNetworkConnection: [{
                cn: 'dicom',
                dicomHostname: 'localhost',
                dicomPort: 104
            }],
            dicomNetworkAE: [{
                dicomNetworkConnectionReference: ['/dicomNetworkConnection/0']
            }]
        };
        let netAEModel;
        netAEModel = newAetModel.dicomNetworkAE[0];
        dicomconn.push({
            'value': '/dicomNetworkConnection/' + 0,
            'name': 'dicom'
        });
        let $this = this;
        this.config.viewContainerRef = this.viewContainerRef;
        this.dialogRef = this.dialog.open(CreateAeComponent, {
            height: 'auto',
            width: '90%'
        });
        this.dialogRef.componentInstance.dicomconn = dicomconn;
        this.dialogRef.componentInstance.newAetModel = newAetModel;
        this.dialogRef.componentInstance.netAEModel = netAEModel;
        this.dialogRef.componentInstance.devices = this.devices;
        this.dialogRef.afterClosed().subscribe(re => {
            if (re){
                console.log('res', re);

                    if (re.mode === 'createdevice'){
                        
                        console.log('re.newaetmodel', re.newaetmodel);
                        if (re.newaetmodel.dicomInstalled === 'true'){
                            re.newaetmodel.dicomInstalled = true;
                        }else{
                            if (re.newaetmodel.dicomInstalled === 'false'){
                                re.newaetmodel.dicomInstalled = false;
                            }else{
                                re.newaetmodel.dicomInstalled = true;
                            }
                        }
                        re.newaetmodel.dicomNetworkAE[0].dicomAssociationInitiator = true;
                        re.newaetmodel.dicomNetworkAE[0].dicomAssociationAcceptor = true;
                        if (!re.newaetmodel.dicomDeviceName || re.newaetmodel.dicomDeviceName === ''){
                            re.newaetmodel.dicomDeviceName = re.newaetmodel.dicomNetworkAE[0].dicomAETitle.toLowerCase();
                        }
                        $this.$http.post('../devices/' + re.newaetmodel.dicomDeviceName, re.newaetmodel, headers)
                            .subscribe( (devre) => {
                                    $this.mainservice.setMessage({
                                        'title': 'Info',
                                        'text': 'Device with the AET created successfully!',
                                        'status': 'info'
                                    });
                                    $this.$http.post('../ctrl/reload', {}, headers).subscribe((res) => {
                                        $this.mainservice.setMessage({
                                            'title': 'Info',
                                            'text': 'Archive reloaded successfully!',
                                            'status': 'info'
                                        });
                                    });
                                    $this.searchAes();
                                },
                                (err) => {
                                    $this.cfpLoadingBar.complete();

                                    $this.httpErrorHandler.handleError(err);
                                });
                    }else{
                        re.device.dicomNetworkAE =  re.device.dicomNetworkAE || [];
                        re.newaetmodel.dicomNetworkAE[0].dicomAssociationInitiator = true;
                        re.newaetmodel.dicomNetworkAE[0].dicomAssociationAcceptor = true;
                        re.device.dicomNetworkAE.push(re.newaetmodel.dicomNetworkAE[0]);
                        $this.$http.put('../devices/' + re.device.dicomDeviceName, re.device)
                            .subscribe((putresponse) => {
                                $this.mainservice.setMessage({
                                    'title': 'Info',
                                    'text': 'Aet added to device successfully!',
                                    'status': 'info'
                                });
                                $this.$http.post('../ctrl/reload', {}).subscribe((res) => {
                                    $this.mainservice.setMessage({
                                        'title': 'Info',
                                        'text': 'Archive reloaded successfully!',
                                        'status': 'info'
                                    });
                                });
                                $this.searchAes();
                            }, (err) => {
                                $this.cfpLoadingBar.complete();

                            });
                    }
                   
            }
        });
    };
    getUserList(){
        let $this = this;
        this.service.getUserList()
            .subscribe((response) => {
                $this.userList = response;
            }, (response) => {
                // vex.dialog.alert("Error loading aes, please reload the page and try again!");
            });
    }
}
