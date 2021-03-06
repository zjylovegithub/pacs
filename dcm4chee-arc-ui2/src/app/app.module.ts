import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }   from '@angular/router';
import {AppComponent} from './app.component';
import {MaterialModule, MdDialogConfig} from '@angular/material';
import { StudiesComponent } from './studies/studies.component';
import { StudiesComponent1 } from './studies/studies.component1';
import { TemplateTreeComponent } from './studies/template-tree/template-tree.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ControlComponent } from './control/control.component';
import { QueuesComponent } from './monitoring/queues/queues.component';
import {SlimLoadingBarModule} from 'ng2-slim-loading-bar';
import { OrderByPipe } from './pipes/order-by.pipe';
import { GetKeyPipe } from './pipes/get-key.pipe';
import {WidgetsModule, WidgetsComponents} from './widgets/widgets.module';
import {CommonModule, DatePipe} from '@angular/common';
import { FormatDAPipe } from './pipes/format-da.pipe';
import { FormatTMPipe } from './pipes/format-tm.pipe';
import { FormatTagPipe } from './pipes/format-tag.pipe';
import { ContentDescriptionPipe } from './pipes/content-description.pipe';
import { FormatAttributeValuePipe } from './pipes/format-attribute-value.pipe';
import { AttributeNameOfPipe } from './pipes/attribute-name-of.pipe';
import { RemovedotsPipe } from './pipes/removedots.pipe';
import {StudiesService} from './studies/studies.service';
import {AppService} from './app.service';
import { AttributeListComponent } from './helpers/attribute-list/attribute-list.component';
import { FileAttributeListComponent } from './helpers/file-attribute-list/file-attribute-list.component';
import {DropdownModule} from 'primeng/components/dropdown/dropdown';
import { TrimPipe } from './pipes/trim.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { KeysPipe } from './pipes/keys.pipe';
import { IodFormGeneratorComponent } from './helpers/iod-form-generator/iod-form-generator.component';
import { TooltipDirective } from './helpers/tooltip/tooltip.directive';
import { ComparewithiodPipe } from './pipes/comparewithiod.pipe';
import { PlaceholderchangerDirective } from './helpers/placeholderchanger.directive';
import {QueuesService} from './monitoring/queues/queues.service';
import { DevicesComponent } from './devices/devices.component';
import {DevicesService} from './devices/devices.service';
import { DeviceConfiguratorComponent } from './device-configurator/device-configurator.component';
import {DynamicFormElementComponent} from './widgets/dynamicform/dynamic-form-element.component';
import {DynamicFormComponent} from './widgets/dynamicform/dynamic-form.component';
import { ExportComponent } from './monitoring/export/export.component';
import {ExportService} from './monitoring/export/export.service';
import { DicomConnectionFormaterPipe } from './pipes/dicom-connection-formater.pipe';
import { AssociationsComponent } from './monitoring/associations/associations.component';
import { StorageCommitmentComponent } from './monitoring/storage-commitment/storage-commitment.component';
import {StorageCommitmentService} from './monitoring/storage-commitment/storage-commitment.service';
import { ConnectionFormaterComponent } from './helpers/connection-formater/connection-formater.component';
import { AeListComponent } from './ae-list/ae-list.component';
import {CreateExporterService} from './widgets/dialogs/create-exporter/create-exporter.service';
import {DeviceConfiguratorService} from './device-configurator/device-configurator.service';
import { UtcPipe } from './pipes/utc.pipe';
import { CustomValidatorDirective } from './helpers/custom-validator/custom-validator.directive';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ControlService} from './control/control.service';
import { FileUploadModule} from 'ng2-file-upload';
import { StorageSystemsComponent } from './monitoring/storage-systems/storage-systems.component';
import {StorageSystemsService} from './monitoring/storage-systems/storage-systems.service';
import {UploadDicomService} from './widgets/dialogs/upload-dicom/upload-dicom.service';
import {WindowRefService} from "./helpers/window-ref.service";
import { MonitoringTabsComponent } from './monitoring/monitoring-tabs.component';
import { Hl7ApplicationsComponent } from './hl7-applications/hl7-applications.component';
import {Hl7ApplicationsService} from "./hl7-applications/hl7-applications.service";
import {AeListService} from "./ae-list/ae-list.service";
import {HttpErrorHandler} from "./helpers/http-error-handler";
import {j4care} from "./helpers/j4care.service";
import {J4careHttpService} from "./helpers/j4care-http.service";
import { ExternalRetrieveComponent } from './monitoring/external-retrieve/external-retrieve.component';
import {ExternalRetrieveService} from "./monitoring/external-retrieve/external-retrieve.service";
import { FilterGeneratorComponent } from './helpers/filter-generator/filter-generator.component';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { ClickOutsideDirective } from './helpers/click-outside.directive';
import {DynamicFieldService} from "./widgets/dynamic-field/dynamic-field.service";
import {TabViewModule} from 'primeng/components/tabview/tabview';
import {InputTextModule} from 'primeng/components/inputtext/inputtext';
import {InputTextareaModule} from 'primeng/components/inputtextarea/inputtextarea';
import {FieldsetModule} from 'primeng/components/fieldset/fieldset';
import {ButtonModule} from 'primeng/components/button/button';
import {TreeModule} from 'primeng/components/tree/tree';
import { StudyChecklistComponent } from './study-checklist/study-checklist.component';
import { StudyTabPanelComponent } from './study-tab-panel/study-tab-panel.component';
import { StudyDiagnoseComponent } from './study-diagnose/study-diagnose.component';
import { StudytabService } from './study-tab-panel/study-tab.service';
import {PanelModule} from 'primeng/components/panel/panel';
import {LoginComponent} from './login/login.component';
import {LoginService} from './login/login.service';
import {MessagesModule} from 'primeng/components/messages/messages';
import {MessageModule} from 'primeng/components/message/message';
import {UserConfigComponent} from './user-config/user-config.component';
import {UserConfigService} from './user-config/user-config.service';

@NgModule({
    declarations: [
        AppComponent,
        StudiesComponent,
        LoginComponent,
        UserConfigComponent,
        StudiesComponent1,
        StudyChecklistComponent,
        TemplateTreeComponent,
        PageNotFoundComponent,
        ControlComponent,
        QueuesComponent,
        OrderByPipe,
        GetKeyPipe,
        WidgetsComponents,
        FormatDAPipe,
        FormatTMPipe,
        FormatTagPipe,
        ContentDescriptionPipe,
        FormatAttributeValuePipe,
        AttributeNameOfPipe,
        RemovedotsPipe,
        AttributeListComponent,
        FileAttributeListComponent,
        TrimPipe,
        SearchPipe,
        KeysPipe,
        IodFormGeneratorComponent,
        TooltipDirective,
        ComparewithiodPipe,
        PlaceholderchangerDirective,
        DevicesComponent,
        DeviceConfiguratorComponent,
        DynamicFormElementComponent,
        DynamicFormComponent,
        ExportComponent,
        DicomConnectionFormaterPipe,
        AssociationsComponent,
        StorageCommitmentComponent,
        ConnectionFormaterComponent,
        AeListComponent,
        UtcPipe,
        CustomValidatorDirective,
        StorageSystemsComponent,
        MonitoringTabsComponent,
        Hl7ApplicationsComponent,
        ExternalRetrieveComponent,
        FilterGeneratorComponent,
        ClickOutsideDirective,
        StudyChecklistComponent,
        StudyTabPanelComponent,
        StudyDiagnoseComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        MaterialModule.forRoot(),
        SlimLoadingBarModule.forRoot(),
        WidgetsModule,
        CommonModule,
        CalendarModule,
        TabViewModule,
        InputTextModule,
        InputTextareaModule,
        ButtonModule,
        FieldsetModule,
        TreeModule,
        MessagesModule,
        MessageModule,
        DropdownModule,
        PanelModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        FileUploadModule,
        RouterModule.forRoot([
            {
              path: '',
              redirectTo: '/login',
              pathMatch: 'full'
            },
            {
                path: 'studytab',
                redirectTo: '/studytab',
                pathMatch: 'full'
            },
            {
                path: 'studycheck',
                redirectTo: '/studycheck',
                pathMatch: 'full'
            },
            // {
            //   path: '',
            //   redirectTo: '/studies',
            //   pathMatch: 'full'
            // },
            {
                path: 'monitoring',
                redirectTo: '/monitoring/queues',
                pathMatch: 'full'
            },
            { path: 'login', component: LoginComponent},
            { path: 'user/list', component: UserConfigComponent},
            { path: 'studies', component: StudiesComponent },
            { path: 'studytab', component: StudyTabPanelComponent },
            { path: 'studycheck', component: StudyChecklistComponent },
            { path: 'studies1', component: StudiesComponent1 },
            { path: 'studies/tree', component: TemplateTreeComponent },
            { path: 'monitoring/control', component: ControlComponent },
            { path: 'monitoring/export', component: ExportComponent },
            { path: 'monitoring/external', component: ExternalRetrieveComponent },
            { path: 'monitoring/queues', component: QueuesComponent },
            { path: 'monitoring/associations', component: AssociationsComponent },
            { path: 'monitoring/storage-commitment', component: StorageCommitmentComponent },
            { path: 'monitoring/storage-systems', component: StorageSystemsComponent },
            { path: 'device/devicelist', component: DevicesComponent },
            { path: 'device/aelist', component: AeListComponent },
            { path: 'device/hl7applications', component: Hl7ApplicationsComponent },
            { path: 'device/edit/:device', component: DeviceConfiguratorComponent },
            { path: 'device/edit/:device/:devicereff', component: DeviceConfiguratorComponent },
            { path: 'device/edit/:device/:devicereff/:schema', component: DeviceConfiguratorComponent },
            { path: 'device/edit/:device/:devicereff/:schema/:clone', component: DeviceConfiguratorComponent },
            { path: '**', component: PageNotFoundComponent }
      ],
            { useHash: true })
    ],
    entryComponents: [WidgetsComponents],
    providers: [
        MdDialogConfig,
        WidgetsComponents,
        AppService,
        StudiesService,
        LoginService,
        UserConfigService,
        ControlService,
        QueuesService,
        DevicesService,
        ExportService,
        J4careHttpService,
        DatePipe,
        CalendarModule,
        DropdownModule,
        StorageCommitmentService,
        StorageSystemsService,
        CreateExporterService,
        DeviceConfiguratorService,
        UploadDicomService,
        WindowRefService,
        Hl7ApplicationsService,
        AeListService,
        HttpErrorHandler,
        j4care,
        ExternalRetrieveService,
        DynamicFieldService,
        StudytabService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
