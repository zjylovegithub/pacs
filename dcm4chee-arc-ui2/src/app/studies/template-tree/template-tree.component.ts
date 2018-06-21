import {Component, OnInit} from '@angular/core';

import {TreeNode} from 'primeng/components/common/api';
import {StudiesService} from '../studies.service';

@Component({
    selector: 'app-template-tree',
    templateUrl: './template-tree.component.html'
})
export class TemplateTreeComponent implements OnInit {

    files: TreeNode[];

    selectedFile: TreeNode;

    constructor(private studiesService: StudiesService) {}

    ngOnInit() {
        console.log("get template");
        this.studiesService.getTemplate().then(files => this.files = files);
        console.log("template" + this.files);
    }

}