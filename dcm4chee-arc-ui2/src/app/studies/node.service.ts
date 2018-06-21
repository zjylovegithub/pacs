import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import {TreeNode} from 'primeng/components/common/api';

@Injectable()
export class NodeService {

    constructor(private http: Http) {}

    getTemplate() {
        return this.http.get('showcase/resources/data/files.json')
                    .toPromise()
                    .then(res => <TreeNode[]> res.json().data);
    }
}