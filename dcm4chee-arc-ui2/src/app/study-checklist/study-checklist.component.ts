import { Component, OnInit,ViewContainerRef,Input } from '@angular/core';
//import {Component, ViewContainerRef, OnDestroy, Input, trigger, transition, style, animate, OnInit} from '@angular/core';
import {MdDialogConfig, MdDialog, MdDialogRef} from '@angular/material';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

import {J4careHttpService} from "../helpers/j4care-http.service";
import {j4care} from "../helpers/j4care.service";
import {WindowRefService} from "../helpers/window-ref.service";
import { HttpErrorHandler } from '../helpers/http-error-handler';

import { StudiesService } from '../studies/studies.service';
import { User } from '../models/user';
import { AppService } from '../app.service';
import {UploadDicomComponent} from '../widgets/dialogs/upload-dicom/upload-dicom.component';
import {UploadFilesComponent} from "../widgets/dialogs/upload-files/upload-files.component";
import { ConfirmComponent } from '../widgets/dialogs/confirm/confirm.component';
import {Globalvar} from '../constants/globalvar';

import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { StudytabService } from '../study-tab-panel/study-tab.service';

@Component({
  selector: 'app-study-checklist',
  templateUrl: './study-checklist.component.html',
})
export class StudyChecklistComponent implements OnInit {
  
  patientSexOptions = [
    {label:'==请选择==', value:null},
    {label:'男', value:'M'},
    {label:'女', value:'F'},
  ];

  hpOptions = [
    {label:'==请选择==', value:null},
    {label:'阳性', value:'positive'},
    {label:'阴性', value:'negative'},
  ];

  options = {genders:
    [
        {
            'vr': 'CS',
            'Value': ['M'],
            'title': '男'
        },
        {
            'vr': 'CS',
            'Value': ['F'],
            'title': '女'
        }
    ]
  };

  filter = {
    orderby: '-StudyDate,-StudyTime',
    ModalitiesInStudy: '',
    'ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate': '',
    'ScheduledProcedureStepSequence.ScheduledProcedureStepStatus': '',
    returnempty: false,
    PatientSex: '',
    PatientAge: '',
    PatientBirthDate: '',
    StudyDate:'',
    StudyTime:''
    
  };
  filterMode = 'study';
  showFilterWarning: boolean;
  showModalitySelector = false;
  modalities: any;
  user: User;
  isRole: any;
  queryMode = 'queryStudies';
  studies = []; // 新增
  externalInternalAetMode = "internal";
  dialogRef: MdDialogRef<any>;
  aes: any;
  aetmodel: any;
  aet: any;
  externalInternalAetModel:any;
  allAes;
  attributeFilters: any = {};
  exporters;
  exporterID = null;
  rjnotes;
  reject;
  subscription: Subscription;
  _=_;
  limit = 20;
  patients = [];
  morePatients;
  moreStudies;
  count;
  size;
  advancedConfig = false;
  titleLabel = 'Edit patient';
  saveLabel = 'SAVE';
  visibleHeaderIndex = 0;

  constructor(
    public $http: J4careHttpService,
    public service: StudiesService,
    public mainservice: AppService,
    public config: MdDialogConfig,
    public dialog: MdDialog,
    public httpErrorHandler:HttpErrorHandler,
    public cfpLoadingBar: SlimLoadingBarService,
    public viewContainerRef: ViewContainerRef,
    private tabservice: StudytabService
  ) { }

  ngOnInit() {
    // this.user=this.mainservice.user;
    this.init();
  }

  private init(){
    let $this = this;

    this.modalities = Globalvar.MODALITIES;
    this.initAETs(2);
    this.getAllAes(2);
    this.initAttributeFilter('Patient', 1);
    this.initExporters(2);
    this.initRjNotes(2);

    if (!this.mainservice.user){
        // console.log("in if studies ajax");
        this.mainservice.user = this.mainservice.getUserInfo().share();
        this.mainservice.user
            .subscribe(
                (response) => {
                    $this.user.user  = response.user;
                    $this.mainservice.user.user = response.user;
                    $this.user.roles = response.roles;
                    $this.mainservice.user.roles = response.roles;
                    $this.isRole = (role) => {
                        if (response.user === null && response.roles.length === 0){
                            return true;
                        }else{
                            if (response.roles && response.roles.indexOf(role) > -1){
                                return true;
                            }else{
                                return false;
                            }
                        }
                    };
                },
                (response) => {
                    // $this.user = $this.user || {};
                    $this.user.user = 'user';
                    $this.mainservice.user.user = 'user';
                    $this.user.roles = ['user', 'admin'];
                    $this.mainservice.user.roles = ['user', 'admin'];
                    $this.isRole = (role) => {
                        if (role === 'admin'){
                            return false;
                        }else{
                            return true;
                        }
                    };
                }
            );

    }else{
        this.user = this.mainservice.user;
        this.isRole = this.mainservice.isRole;
        // console.log("isroletest",this.user.applyisRole("admin"));
    }

    this.subscription = this.mainservice.createPatient$.subscribe(patient => {
      console.log('patient in subscribe messagecomponent ', patient);
      //this.createPatient();
  });
  }

  initAETs(retries) {
    if (!this.aes){
        let $this = this;
       this.$http.get('../aets')
            .map(res => {let resjson; try{
                let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
                if(pattern.exec(res.url)){
                    WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
                }
                resjson = res.json(); }catch (e){resjson = {}; } return resjson; })
            .subscribe(
                function (res) {
                    console.log('before call getAes', res, 'this user=', $this.user);
                    $this.aes = j4care.extendAetObjectWithAlias($this.service.getAes($this.user, res));
                    console.log('aes', $this.aes);
                    console.log('$this.aes after map', $this.aes);
                    $this.aet = $this.aes[0].dicomAETitle.toString();

                    if (!$this.aetmodel){
                        $this.aetmodel = $this.aes[0];
                    }

                    // new add
                    $this.aet = $this.aes[2].dicomAETitle.toString();
                    $this.aetmodel = $this.aes[2];
                    $this.externalInternalAetModel = 'internal';
                    $this.showFilterWarning = false;
                    $this.queryStudies(0);

                    // $this.mainservice.setGlobal({aet:$this.aet,aetmodel:$this.aetmodel,aes:$this.aes, aesdropdown:$this.aesdropdown});
                },
                function (res) {
                    if (retries)
                        $this.initAETs(retries - 1);
            });
    }
}
getAllAes(retries) {
    let $this = this;
    this.$http.get('../aes')
        .map(res => {let resjson; try{
            let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
            if(pattern.exec(res.url)){
                WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
            }
            resjson = res.json(); }catch (e){resjson = {}; } return resjson; })
        .subscribe(
            function (res) {
                console.log('before call getAes', res, 'this user=', $this.user);
                $this.allAes = j4care.extendAetObjectWithAlias(res.map((res)=>{
                    res['title'] = res['dicomAETitle'];
                    res['description'] = res['dicomDescription'];
                    return res;
                }));
                $this.externalInternalAetModel = $this.allAes[0];
            },
            function (res) {
                if (retries)
                    $this.getAllAes(retries - 1);
        });
}
initAttributeFilter(entity, retries) {
  let $this = this;
 this.$http.get('../attribute-filter/' + entity)
      .map(res => {let resjson; try{
          let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
          if(pattern.exec(res.url)){
              WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
          }
          resjson = res.json(); }catch (e){resjson = {}; } return resjson; })
      .subscribe(
          function (res) {
              if (entity === 'Patient' && res.dcmTag){
                  let privateAttr = [parseInt('77770010', 16), parseInt('77771010', 16), parseInt('77771011', 16)];
                  res.dcmTag.push(...privateAttr);
              }
              $this.attributeFilters[entity] = res;
              console.log('this.attributeFilters', $this.attributeFilters);
          },
          function (res) {
              if (retries)
                  $this.initAttributeFilter(entity, retries - 1);
      });
};

initExporters(retries) {
  let $this = this;
 this.$http.get('../export')
      .map(res => {let resjson; try{
          let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
          if(pattern.exec(res.url)){
              WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
          }
          resjson = res.json(); }catch (e){resjson = {}; } return resjson; })
      .subscribe(
          function (res) {
              $this.exporters = res;
              if (res && res[0] && res[0].id){
                  $this.exporterID = res[0].id;
              }
              // $this.mainservice.setGlobal({exporterID:$this.exporterID});
          },
          function (res) {
              if (retries)
                  $this.initExporters(retries - 1);
          });
  }

  initRjNotes(retries) {
    let $this = this;
    this.$http.get('../reject')
        .map(res => {let resjson; try{
            let pattern = new RegExp("[^:]*:\/\/[^\/]*\/auth\/");
            if(pattern.exec(res.url)){
                WindowRefService.nativeWindow.location = "/dcm4chee-arc/ui2/";
            }
            resjson = res.json(); }catch (e){resjson = {}; } return resjson; })
        .subscribe(
            function (res) {
                let rjnotes = res;
                rjnotes.sort(function (a, b) {
                    if (a.codeValue === '113039' && a.codingSchemeDesignator === 'DCM')
                        return -1;
                    if (b.codeValue === '113039' && b.codingSchemeDesignator === 'DCM')
                        return 1;
                    return 0;
                });
                $this.rjnotes = rjnotes;
                $this.reject = rjnotes[0].codeValue + '^' + rjnotes[0].codingSchemeDesignator;

                // $this.mainservice.setGlobal({rjnotes:rjnotes,reject:$this.reject});
            },
            function (res) {
                if (retries)
                    $this.initRjNotes(retries - 1);
        });
  }
  createQueryParams(offset, limit, filter) {
        let params = {
            includefield: 'all',
            offset: offset,
            limit: limit
        };
        for (let key in filter){
            if (filter[key] || filter[key] === false){
                params[key] = filter[key];
            }
        }
        return params;
  }

  createStudyFilterParams() {
      let filter = Object.assign({}, this.filter);
      delete filter['ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate'];
      delete filter['ScheduledProcedureStepSequence.ScheduledProcedureStepStartTime'];
      return filter;
  }

  selectModality(key){
    this.filter.ModalitiesInStudy = '';
    this.filter['ScheduledProcedureStepSequence.Modality'] = '';
    if(this.filterMode === 'mwl')
        this.filter['ScheduledProcedureStepSequence.Modality'] = key;
    else
        this.filter.ModalitiesInStudy = key;
    $('.Modality').show();
    this.showModalitySelector = false;
   };

  queryStudies(offset) {
    this.queryMode = 'queryStudies';
    //this.moreMWL = undefined;
    //this.morePatients = undefined;
    let $this = this;
    let queryParameters = this.createQueryParams(offset, this.limit + 1, this.createStudyFilterParams());
    if (this.showNoFilterWarning(queryParameters) && this.showFilterWarning) {
        $this.confirm({
            content: 'No filter are set, are you sure you want to continue?'
        }).subscribe(result => {
            if (result){
                $this.queryStudie(queryParameters, offset);
            }
        });
    }else{
            $this.queryStudie(queryParameters, offset);
    }
    this.showFilterWarning = true;

  }; 

  confirm(confirmparameters){
      this.scrollToDialog();
      this.config.viewContainerRef = this.viewContainerRef;
      this.dialogRef = this.dialog.open(ConfirmComponent, {
          height: 'auto',
          width: '500px'
      });
      this.dialogRef.componentInstance.parameters = confirmparameters;
      return this.dialogRef.afterClosed();
  };

  scrollToDialog(){
      let counter = 0;
      let i = setInterval(function(){
          if (($('.md-overlay-pane').length > 0)) {
              clearInterval(i);
              $('html, body').animate({
                  scrollTop: ($('.md-overlay-pane').offset().top)
              }, 200);
          }
          if (counter > 200){
              clearInterval(i);
          }else{
              counter++;
          }
      }, 50);
  }


  showNoFilterWarning(queryParameters){
      let param =  _.clone(queryParameters);
      if (param['orderby'] == '-StudyDate,-StudyTime'){
          if (_.hasIn(param, ['ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate'])){
              delete param['ScheduledProcedureStepSequence.ScheduledProcedureStepStartDate'];
          }
          if (_.hasIn(param, 'includefield')){
              delete param['includefield'];
          }
          if (_.hasIn(param, 'limit')){
              delete param['limit'];
          }
          if (_.hasIn(param, 'offset')){
              delete param['offset'];
          }
          if (_.hasIn(param, 'orderby')){
              delete param['orderby'];
          }
          if(_.size(param) < 1){
              return true
          }else{
              for(let p in param){
                  if(param[p] == "")
                      delete param[p];
              }
          }
          return (_.size(param) < 1) ? true : false;
      }else{
          return false;
      }
  }
  rsURL() {
      return this.service.rsURL(this.externalInternalAetMode,this.aet,this.aetmodel.dicomAETitle,this.externalInternalAetModel.dicomAETitle);
  }

  extractAttrs(attrs, tags, extracted) {
      for (let tag in attrs){
              if (_.indexOf(tags, tag) > -1){
                  extracted[tag] = attrs[tag];
              }
      }
  }

  extendedFilter(...args: any[]){
      if (args.length > 1){
          args[1].preventDefault();
          args[1].stopPropagation();
      }
          this.advancedConfig = args[0];
          if ($('.div-table *').length > 0){
              $('.div-table').removeAttr( 'style' );
                  setTimeout(function() {
                      let marginTop: any = $('.div-table').css('margin-top');
                      if (marginTop){
                          marginTop = marginTop.replace(/[^0-9]/g, '');
                          let outerHeight: any = $('.headerblock').outerHeight();
                          if (marginTop && marginTop < outerHeight && args[0] === true){
                              $('.div-table.extended').css('margin-top', outerHeight);
                          }
                      }
                  }, 50);
          }
  }

  queryStudie(queryParameters, offset){
      let $this = this;
      if (offset < 0 || offset === undefined) offset = 0;
      this.cfpLoadingBar.start();
      this.service.queryStudies(
          this.rsURL(),
          queryParameters
      ).subscribe((res) => {

              $this.patients = [];

              $this.studies = [];
              $this.morePatients = undefined;
              $this.moreStudies = undefined;
              $this.count = "";
              $this.size = "";
              if (_.size(res) > 0) {

                  //Add number of patient related studies manuelly hex(00201200) => dec(2101760)
                  let index = 0;
                  while ($this.attributeFilters.Patient.dcmTag[index] && ($this.attributeFilters.Patient.dcmTag[index] < 2101760)) {
                      index++;
                  }
                  $this.attributeFilters.Patient.dcmTag.splice(index, 0, 2101760);

                  let pat, study, patAttrs, tags = $this.attributeFilters.Patient.dcmTag;
                  console.log('res', res);
                  res.forEach(function (studyAttrs, index) {
                      patAttrs = {};
                      $this.extractAttrs(studyAttrs, tags, patAttrs);
                      if (!(pat && _.isEqual(pat.attrs, patAttrs))) { //angular.equals replaced with Rx.helpers.defaultComparer
                          pat = {
                              attrs: patAttrs,
                              studies: [],
                              showAttributes: false
                          };
                          // $this.$apply(function () {
                          $this.patients.push(pat);
                          // });
                      }
                      study = {
                          patient: pat,
                          offset: offset + index,
                          moreSeries: false,
                          attrs: studyAttrs,
                          series: null,
                          showAttributes: false,
                          fromAllStudies: false,
                          selected: false
                      };
                      pat.studies.push(study);
                      $this.extendedFilter(false);
                      // new add 
                      $this.studies.push(study); //sollte weg kommen
                  });
                  console.log("studies1------------", $this.studies);
                  if ($this.moreStudies = (res.length > $this.limit)) {
                      pat.studies.pop();
                      if (pat.studies.length === 0) {
                          $this.patients.pop();
                      }
                      // new add
                      $this.studies.pop();
                  }
                  console.log("studies2-------------", $this.studies);
                  console.log('patients=', $this.patients[0]);
                  console.log('global set', $this.mainservice.global);
                  $this.cfpLoadingBar.complete();

              } else {
                  console.log('in else setmsg');
                  $this.patients = [];

                  $this.mainservice.setMessage({
                      'title': 'Info',
                      'text': 'No matching Studies found!',
                      'status': 'info'
                  });
                  $this.cfpLoadingBar.complete();
              }
              $this.cfpLoadingBar.complete();
          },
          (err) => {
              console.log('in error', err);
              $this.patients = [];
              $this.httpErrorHandler.handleError(err);
              $this.cfpLoadingBar.complete();
          }
      );
  }

  keyDownOnHeader(event){
    if (event.keyCode == 13) {
        this.fireRightQuery();
    }
  }

  uploadDicom(){
    this.config.viewContainerRef = this.viewContainerRef;
    this.dialogRef = this.dialog.open(UploadDicomComponent, {
        height: 'auto',
        width: '500px'
    });
    this.dialogRef.componentInstance.aes = this.aes;
    this.dialogRef.componentInstance.selectedAe = this.aetmodel.dicomAETitle;
    this.dialogRef.afterClosed().subscribe((result) => {
        console.log('result', result);
        if (result){
        }
    });
};

  fireRightQuery(){
    console.log('querymode=', this.queryMode);
    this.showFilterWarning = false;
    this[this.queryMode](0);
  }

  openViewer(model, mode){
      let url,
          configuredUrl;
      console.log('aetmodel', this.aetmodel);
      switch (mode) {
          case 'patient':
              configuredUrl = this.aetmodel.dcmInvokeImageDisplayPatientURL;
              console.log('configuredUrl', configuredUrl);
              url = configuredUrl.substr(0, configuredUrl.length - 2) + model['00100020'].Value[0];
              break;
          case 'study':
              configuredUrl = this.aetmodel.dcmInvokeImageDisplayStudyURL;
              console.log('configuredUrl', configuredUrl);
              url = configuredUrl.substr(0, configuredUrl.length - 2) + model['0020000D'].Value[0];
              break;

      }
      console.log('url', url);
      // $window.open(url);
      this.service.getWindow().location = url;
  };

  createPatient(){
    this.saveLabel = 'CREATE';
    this.titleLabel = 'Create new patient';
    let newPatient: any = {
        'attrs': {
            '00100010': { 'vr': 'PN', 'Value': [{
                Alphabetic: ''
            }]},
            '00100020': { 'vr': 'LO', 'Value': ['']},
            '00100021': { 'vr': 'LO', 'Value': ['']},
            '00100030': { 'vr': 'DA', 'Value': ['']},
            '00100040': { 'vr': 'CS', 'Value': ['']}
        }
    };
    this.buildPatient(newPatient, 'create', null);
};

buildPatient(patient, mode , patientkey){
  console.log("call modifyPatient()",patient);
  console.log('tabservice setindex',1);
  this.tabservice.setindex(1);

  this.modifyPatientObj = patient;
  this.editPatientName = patient.attrs['00100010'].Value[0]['Alphabetic'];
  this.selectedSex = patient.attrs['00100040'].Value[0];
  this.editPatientNo = patient.attrs['00100020'].Value[0];

  //this.editPatientAge = patient.attrs['00101010'].Value[0];
  //this.editModality = patient.attrs['00080061'].Value[0];
  //this.editStudyDate = patient.attrs['00080020'].Value[0];

  //this.editAccessionNumber = patient.attrs['00200010'].Value[0];
  //this.editBodyPartExamined = patient.attrs['00180015'].Value[0];

  //this.editInstitutionalDepartmentName = patient.attrs['00081040'].Value[0];
  //this.editReferringPhysicianName = patient.attrs['00080090'].Value[0];
};


  editPatient(patient, patientkey){
      this.saveLabel = 'SAVE';
      this.titleLabel = 'Edit patient ';
      this.titleLabel += ((_.hasIn(patient, 'attrs.00100010.Value.0.Alphabetic')) ? '<b>' + patient.attrs['00100010'].Value[0]['Alphabetic'] + '</b>' : ' ');
      this.titleLabel += ((_.hasIn(patient, 'attrs.00100020.Value.0')) ? ' with ID: <b>' + patient.attrs['00100020'].Value[0] + '</b>' : '');
      console.log('titleLabel', this.titleLabel);
      this.modifyPatient(patient, 'edit', patientkey);
  };

  modifyPatientObj;
  editModality;
  editPatientAge;
  editPatientNo;
  editPatientName;
  editBodyPartExamined;
  editAccessionNumber;
  editInstitutionalDepartmentName;
  editReferringPhysicianName;
  selectedSex: string;
  editStudyDate;

  

  modifyPatient(patient, mode , patientkey){
      console.log("call modifyPatient()",patient);
      console.log('tabservice setindex',1);
      this.tabservice.setindex(1);

      this.modifyPatientObj = patient;
      this.editPatientName = patient.attrs['00100010'].Value[0]['Alphabetic'];
      this.selectedSex = patient.attrs['00100040'].Value[0];
      this.editPatientNo = patient.attrs['00100020'].Value[0];

      this.editPatientAge = patient.attrs['00101010'].Value[0];
      this.editModality = patient.attrs['00080061'].Value[0];
      this.editStudyDate = patient.attrs['00080020'].Value[0];

      this.editAccessionNumber = patient.attrs['00200010'].Value[0];
      this.editBodyPartExamined = patient.attrs['00180015'].Value[0];

      //this.editInstitutionalDepartmentName = patient.attrs['00081040'].Value[0];
      //this.editReferringPhysicianName = patient.attrs['00080090'].Value[0];
  };

  selectObject(object, modus, fromcheckbox){
        // console.log('in select object modus', modus);
        // console.log('object', object);
        // console.log('object selected', object.selected);
        // console.log('this.clipboard.action', this.clipboard.action);
        this.showClipboardHeaders[modus] = true;
        // if(!fromcheckbox){
            object.selected = !object.selected;
        // }
        this.target = object;
        this.target.modus = modus;
        console.log('2object selected', object.selected);
        // this.selected['otherObjects'][object.attrs["0020000D"].Value[0]]["modus"] = this.selected['otherObjects'][object.attrs["0020000D"].Value[0]]["modus"] || modus;
        // console.log("",);
        if (_.hasIn(object, 'selected') && object.selected === true){
            this.selected['otherObjects'] = this.selected['otherObjects'] || {};
            if (modus === 'patient'){
    /*                if(!_.isset(object.attrs["00100020"].Value[0])){

                }*/
                console.log('issettestid =', _.hasIn(object, 'attrs["00100020"].Value[0]'));
                console.log('issuerhasin =', _.hasIn(object, 'attrs["00100021"].Value[0]'));
                console.log('modus in selectObject patient');
                this.selected['patients'] = this.selected['patients'] || [];
                let patientobject = {};
                patientobject['PatientID'] = object.attrs['00100020'].Value[0];
                // if(object.attrs["00100021"] && object.attrs["00100021"].Value && object.attrs["00100021"].Value[0]){
                if (_.hasIn(object, 'attrs["00100021"].Value[0]') && object.attrs['00100021'].Value[0] != ''){
                    patientobject['IssuerOfPatientID'] = object.attrs['00100021'].Value[0];
                }
                // if((object.attrs["00100024"] && object.attrs["00100024"].Value[0]['00400032'] && object.attrs["00100024"].Value[0]['00400032'].Value[0]) && (object.attrs["00100024"] && object.attrs["00100024"].Value[0]['00400033'] && object.attrs["00100024"].Value[0]['00400033'].Value[0])){
                if (_.hasIn(object, 'attrs.00100024.Value[0].00400032.Value[0]') && _.hasIn(object, 'attrs.00100024.Value[0].00400033.Value[0]') && (object.attrs['00100024'].Value[0]['00400032'].Value[0] != '') && (object.attrs['00100024'].Value[0]['00400033'].Value[0] != '')){
                    patientobject['IssuerOfPatientIDQualifiers'] = {
                        'UniversalEntityID': object.attrs['00100024'].Value[0]['00400032'].Value[0],
                        'UniversalEntityIDType': object.attrs['00100024'].Value[0]['00400033'].Value[0]
                    };
                }
                // console.log("check if patient in select selected =",this.service.getPatientId(this.selected.patients));
                let patientInSelectedObject = false;
                _.forEach(this.selected.patients, (m, i) => {
                    // console.log('i=', i);
                    // console.log('m=', m);
                    // console.log('patientid', this.service.getPatientId(m));
                    if (this.service.getPatientId(m) === this.service.getPatientId(patientobject)){
                        patientInSelectedObject = true;
                    }
                });
                patientobject["attrs"] = object.attrs || {};
                console.log('patientobject =', this.service.getPatientId(patientobject));
                if (!patientInSelectedObject){
                    this.selected['patients'].push(patientobject);
                }
    /*                this.selected['patients'].push({
                    "PatientID": object.attrs["00100020"].Value[0],
                    "IssuerOfPatientID": ((object.attrs["00100021"] && object.attrs["00100021"].Value && object.attrs["00100021"].Value[0]) ? object.attrs["00100021"].Value[0]:''),
                    "IssuerOfPatientIDQualifiers": {
                        "UniversalEntityID": ((object.attrs["00100024"] && object.attrs["00100024"].Value[0]['00400032'] && object.attrs["00100024"].Value[0]['00400032'].Value[0]) ? object.attrs["00100024"].Value[0]['00400032'].Value[0] : ''),
                        "UniversalEntityIDType": ((object.attrs["00100024"] && object.attrs["00100024"].Value[0]['00400033'] && object.attrs["00100024"].Value[0]['00400033'].Value[0]) ? object.attrs["00100024"].Value[0]['00400033'].Value[0] : '')
                    }
                });*/

                this.selected['otherObjects'][object.attrs['00100020'].Value[0]] = this.selected['otherObjects'][object.attrs['00100020'].Value[0]] || {};
                this.selected['otherObjects'][object.attrs['00100020'].Value[0]] = patientobject;
            }else{
                this.selected['otherObjects'][object.attrs['0020000D'].Value[0]] = this.selected['otherObjects'][object.attrs['0020000D'].Value[0]] || {};
                this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['StudyInstanceUID'] = this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['StudyInstanceUID'] || object.attrs['0020000D'].Value[0];
            }
            if (modus === 'study'){
                _.forEach(object.series, (m, k) => {
                    m.selected = object.selected;
                    _.forEach(m.instances, (j, i) => {
                        j.selected = object.selected;
                    });
                });
            }
            if (modus === 'series'){
                _.forEach(object.instances, function(j, i){
                    j.selected = object.selected;
                });
                this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'] = this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'] || [];
                let SeriesInstanceUIDInArray = false;
                if (this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence']){
                    _.forEach(this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'], function(s, l){
                        console.log('s', s);
                        console.log('l', l);
                        if (s.SeriesInstanceUID === object.attrs['0020000E'].Value[0]){
                            SeriesInstanceUIDInArray = true;
                        }
                    });
                }else{
                    SeriesInstanceUIDInArray = false;
                }
                if (!SeriesInstanceUIDInArray){
                    this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'].push({
                        'SeriesInstanceUID': object.attrs['0020000E'].Value[0]
                    });
                }
            }
            if (modus === 'instance'){

                this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'] = this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'] || [];
                let SeriesInstanceUIDInArray = false;
                if (this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence']){

                    _.forEach(this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'], function(s, l){
                        if (s.SeriesInstanceUID === object.attrs['0020000E'].Value[0]){
                            SeriesInstanceUIDInArray = true;
                        }
                    });
                }else{
                    SeriesInstanceUIDInArray = false;
                }
                if (!SeriesInstanceUIDInArray){
                    this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'].push({
                        'SeriesInstanceUID': object.attrs['0020000E'].Value[0]
                    });
                }
                let $this = this;
                _.forEach($this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'], function(m, i){
                    if (m.SeriesInstanceUID === object.attrs['0020000E'].Value[0]){

                        $this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'][i]['ReferencedSOPSequence'] = $this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'][i]['ReferencedSOPSequence'] || [];

                        let sopClassInstanceUIDInArray = false;
                        _.forEach($this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'][i]['ReferencedSOPSequence'], function(m2, i2){
                            if (m2.ReferencedSOPClassUID && m2.ReferencedSOPClassUID === object.attrs['00080016'].Value[0] && m2.ReferencedSOPInstanceUID && m2.ReferencedSOPInstanceUID === object.attrs['00080018'].Value[0]){
                                sopClassInstanceUIDInArray = true;
                            }
                        });
                        if (!sopClassInstanceUIDInArray){
                            $this.selected['otherObjects'][object.attrs['0020000D'].Value[0]]['ReferencedSeriesSequence'][i]['ReferencedSOPSequence'].push(                                                                                                                    {
                                'ReferencedSOPClassUID': object.attrs['00080016'].Value[0],
                                'ReferencedSOPInstanceUID': object.attrs['00080018'].Value[0]
                            });
                        }
                    }
                });
            }
        }else{
            if (modus === 'patient'){
                console.log('modus in selectObject patient', this.selected['otherObjects']);
                // if(this.clipboard.action === 'merge'){
    /*                this.selected['otherObjects']["patients"] = this.selected['patients'] || [];
                this.selected['patients'].push({
                    "PatientID": object.attrs["00100020"].Value[0],
                    "IssuerOfPatientID": ((object.attrs["00100020"]) ? object.attrs["00100020"].Value[0]:''),
                    "IssuerOfPatientIDQualifiers": {
                        "UniversalEntityID": ((object.attrs["00100024"] && object.attrs["00100024"].Value[0]['00400032'] && object.attrs["00100024"].Value[0]['00400032'].Value[0]) ? object.attrs["00100024"].Value[0]['00400032'].Value[0] : ''),
                        "UniversalEntityIDType": ((object.attrs["00100024"] && object.attrs["00100024"].Value[0]['00400033'] && object.attrs["00100024"].Value[0]['00400033'].Value[0]) ? object.attrs["00100024"].Value[0]['00400033'].Value[0] : '')
                    }
                });*/
                let $this = this;
                _.forEach(this.selected['patients'], (m, i) => {
                    console.log('m', m);
                    // console.log("ifcheck,mpatientid",m.PatientID);
                    // console.log("ifcheck,objectpid",object.attrs["00100020"].Value[0]);
                    if (m && m.PatientID === object.attrs['00100020'].Value[0]){
                        console.log('in if', $this.selected['patients'][i]);
                      this.selected['patients'].splice(i, 1);
                        console.log('in if', $this.selected['otherObjects']);
                    }
                    console.log('i', i);
                });
                delete this.selected['otherObjects'][object.attrs['00100020'].Value[0]];
                // this.selected['otherObjects'][object.attrs["00100020"].Value[0]] = this.selected['otherObjects'][object.attrs["00100020"].Value[0]] || {};
                // }else{
                // }
            }else{
                console.log('in else', modus);
                if (_.hasIn(this.selected, ['otherObjects', object.attrs['0020000D'].Value[0]])){
                    delete this.selected['otherObjects'][object.attrs['0020000D'].Value[0]];
                }
                if (modus === 'study'){
                    _.forEach(object.series, (m, k) => {
                        m.selected = object.selected;
                        _.forEach(m.instances, (j, i) => {
                            j.selected = object.selected;
                        });
                    });
                }
                if (modus === 'series'){
                    _.forEach(object.instances, function(j, i){
                        j.selected = object.selected;
                    });
                }
    /*                this.selected['otherObjects'][object.attrs["0020000D"].Value[0]] = this.selected['otherObjects'][object.attrs["0020000D"].Value[0]] || {};
                this.selected['otherObjects'][object.attrs["0020000D"].Value[0]]["StudyInstanceUID"] = this.selected['otherObjects'][object.attrs["0020000D"].Value[0]]["StudyInstanceUID"] || object.attrs["0020000D"].Value[0];*/
            }
        }
        // this.selected['otherObjects'][modus] = this.selected['otherObjects'][modus] || [];
        // this.selected['otherObjects'][modus].push(object);
        console.log('this.selected[\'otherObjects\']', this.selected['otherObjects']);
    }
  
  lastSelect: any;
  target;
  showClipboardHeaders = {
      'study': false,
      'series': false,
      'instance': false
  };
  selected: any = {
      hasPatient: false
  };
  showCheckboxes = false;
  keysdown: any = {};
  anySelected;
  clipboardHasScrollbar = false;
  lastSelectedObject = {modus: ''};
  select(object, modus, keys, fromcheckbox){
    // let test = true;
    let clickFromCheckbox = (fromcheckbox && fromcheckbox === 'fromcheckbox');
    if (this.isRole('admin')){
        this.anySelected = true;
        this.lastSelectedObject = object;
        this.lastSelectedObject.modus = modus;
        /*
        * If the function was called from checkbox go in there
        * */
        if (clickFromCheckbox){
            console.log('in if fromcheckbox', fromcheckbox);
            this.selectObject(object, modus, true);
        }

        console.log('in ctrlclick keysdown', this.keysdown);
        console.log('Object.keys(this.keysdown).length', Object.keys(this.keysdown).length);
        //ctrl + click
        if (this.keysdown && Object.keys(this.keysdown).length === 1 && (this.keysdown[17] === true || this.keysdown[91] === true || this.keysdown[93] === true || this.keysdown[224] === true)){
            this.selectObject(object, modus, false);
        }
        // //close contextmenu (That's a bug on contextmenu module. The bug has been reported)
        // $(".dropdown.contextmenu").addClass('ng-hide');

        //Shift + click
        console.log('before shiftclick');
        if (this.keysdown && Object.keys(this.keysdown).length === 1 && this.keysdown[16] === true){
            console.log('in shift click');
            this.service.clearSelection(this.patients);
            if (!this.lastSelect){
                this.selectObject(object, modus, false);
                this.lastSelect = {'keys': keys, 'modus': modus};
            }else{
                if (modus != this.lastSelect.modus){
                    this.service.clearSelection(this.patients);
                    this.selectObject(object, modus, false);
                    this.lastSelect = {'keys': keys, 'modus': modus};
                }else{
                    switch (modus) {
                        case 'patient':
                            this.selectObject(object, modus, false);
                            break;
                        case 'study':
                            // {"patientkey":patientkey,"studykey":studykey}
                            if (keys.patientkey != this.lastSelect.keys.patientkey){
                                this.service.clearSelection(this.patients);
                                this.selectObject(object, modus, false);
                                this.lastSelect = {'keys': keys, 'modus': modus};
                            }else{
                                console.log('keys.studykey', keys.studykey);
                                console.log('this.lastSelect.keys.studykey', this.lastSelect.keys.studykey);
                                if (keys.studykey > this.lastSelect.keys.studykey){
                                    for (let i = keys.studykey; i >= this.lastSelect.keys.studykey; i--) {
                                        console.log('i', i);
                                        console.log('this.patients[keys.patientkey].studies[i]=', this.patients[keys.patientkey].studies[i]);
                                        // this.patients[keys.patientkey].studies[i].selected = true;
                                        this.selectObject(this.patients[keys.patientkey].studies[i], modus, false);
                                    }
                                }else{
                                    for (let i = this.lastSelect.keys.studykey; i >= keys.studykey; i--) {
                                        console.log('this.patients[keys.patientkey].studies[i]=', this.patients[keys.patientkey].studies[i]);
                                        // this.patients[keys.patientkey].studies[i].selected = true;
                                        this.selectObject(this.patients[keys.patientkey].studies[i], modus, false);
                                    }
                                }
                                this.lastSelect = {};
                            }
                            break;
                        case 'series':
                            console.log('series');
                            console.log('keys', keys);
                            if (keys.patientkey != this.lastSelect.keys.patientkey || keys.studykey != this.lastSelect.keys.studykey){
                                this.service.clearSelection(this.patients);
                                this.selectObject(object, modus, false);
                                this.lastSelect = {'keys': keys, 'modus': modus};
                            }else{
                                console.log('keys.studykey', keys.serieskey);
                                console.log('this.lastSelect.keys.studykey', this.lastSelect.keys.serieskey);
                                if (keys.serieskey > this.lastSelect.keys.serieskey){
                                    for (let i = keys.serieskey; i >= this.lastSelect.keys.serieskey; i--) {
                                        console.log('i', i);
                                        console.log('this.patients[keys.patientkey].studies[i]=', this.patients[keys.patientkey].studies[keys.studykey].series[i]);
                                        // this.patients[keys.patientkey].studies[i].selected = true;
                                        this.selectObject(this.patients[keys.patientkey].studies[keys.studykey].series[i], modus, false);
                                    }
                                }else{
                                    for (let i = this.lastSelect.keys.serieskey; i >= keys.serieskey; i--) {
                                        console.log('this.patients[keys.patientkey].studies[i]=', this.patients[keys.patientkey].studies[keys.studykey].series[i]);
                                        // this.patients[keys.patientkey].studies[i].selected = true;
                                        this.selectObject(this.patients[keys.patientkey].studies[keys.studykey].series[i], modus, false);
                                    }
                                }
                                this.lastSelect = {};
                            }
                            break;
                        case 'instance':
                            console.log('series');
                            console.log('keys', keys);
                            console.log('this.patients', this.patients[keys.patientkey]);
                            if (keys.patientkey != this.lastSelect.keys.patientkey || keys.studykey != this.lastSelect.keys.studykey || keys.serieskey != this.lastSelect.keys.serieskey){
                                this.service.clearSelection(this.patients);
                                this.selectObject(object, modus, false);
                                this.lastSelect = {'keys': keys, 'modus': modus};
                            }else{
                                console.log('keys.studykey', keys.instancekey);
                                console.log('this.lastSelect.keys.studykey', this.lastSelect.keys.instancekey);
                                if (keys.instancekey > this.lastSelect.keys.instancekey){
                                    for (let i = keys.instancekey; i >= this.lastSelect.keys.instancekey; i--) {
                                        console.log('i', i);
                                        // console.log("this.patients[keys.patientkey].studies[i]=",this.patients[keys.patientkey].studies[keys.studykey].series[keys.studykey].instances[i]);
                                        // this.patients[keys.patientkey].studies[i].selected = true;
                                        this.selectObject(this.patients[keys.patientkey].studies[keys.studykey].series[keys.serieskey].instances[i], modus, false);
                                    }
                                }else{
                                    for (let i = this.lastSelect.keys.instancekey; i >= keys.instancekey; i--) {
                                        // console.log("this.patients[keys.patientkey].studies[keys.studykey].series[keys.studykey].instances[i]=",this.patients[keys.patientkey].studies[keys.studykey].series[keys.studykey].instances[i]);
                                        // this.patients[keys.patientkey].studies[i].selected = true;
                                        this.selectObject(this.patients[keys.patientkey].studies[keys.studykey].series[keys.serieskey].instances[i], modus, false);
                                    }
                                }
                                this.lastSelect = {};
                            }
                            break;
                        default:
                        //
                    }
                }
            }
        }
        console.log('before keyend');
        if (!this.showCheckboxes && !clickFromCheckbox && this.keysdown && Object.keys(this.keysdown).length === 0 && this.anySelected){
            this.service.clearSelection(this.patients);
            this.anySelected = false;
            this.selected = {};
            // this.selected['otherObjects'] = {};
        }
        if (modus === 'patient'){
            console.log('this.selected', this.selected);
            //console.log("this.selectedkeys",Object.keys(this.selected.patients).length);
            //console.log("patient.length",_.size(this.selected.patients));
            if (_.size(this.selected.patients) > 0){
                this.selected.hasPatient = true;
            }else{
                this.selected.hasPatient = false;
            }
        }
        try {
            this.clipboardHasScrollbar = $('#clipboard_content').get(0).scrollHeight > $('#clipboard_content').height();
        }catch (e){

        }
    }
};

}
