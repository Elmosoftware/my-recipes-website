import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { CoreService } from "../services/core-service";
import { EntityService } from "../services/entity-service";
import { APIQueryParams, QUERY_PARAM_PUB, QUERY_PARAM_OWNER } from "../services/api-query-params";
import { Entity } from "../model/entity";
import { APIResponseParser } from "../services/api-response-parser";
import { ConfirmDialogConfiguration } from "../standard-dialogs/standard-dialog.service";

@Component({
  selector: 'app-backend-entities',
  templateUrl: './entities.component.html',
  styleUrls: ['./entities.component.css']
})
export class EntitiesComponent implements OnInit {

  model: Entity[];
  type: string;
  title: string;
  defaultSort: string;
  svc: EntityService;

  constructor(private core: CoreService,
    private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.type = this.route.snapshot.data['type'];
    this.title = this.route.snapshot.data['title'];
    this.defaultSort = this.route.snapshot.data['defaultSort'];
    this.svc = this.core.entityFactory.getService(this.type);

    this.dataRefresh();
  }

  dataRefresh() {

    let q = new APIQueryParams();
    q.pub = QUERY_PARAM_PUB.all; //We would like to see all the entities, regardless if they are published or not.

    if (this.defaultSort) {
      q.sort = this.defaultSort;
    }

    this.svc.get("", q)
      .subscribe(
        data => {
          this.model = new APIResponseParser(data).entities;

          if (this.model.length == 0) {
            this.core.toast.showInformation(`La búsqueda no devolvió resultados. Agregue un elemento haciendo click en el botón "+".`);
          }
        },
        err => {
          throw err
        });
  }

  openDialog(entityId: string): void {

    this.core.helper.removeTooltips(this.core.zone);
    console.log(`Received Entity ID: "${entityId}"`);

    if (entityId) {

      let query = new APIQueryParams();
      query.pop = "false";
      query.pub = QUERY_PARAM_PUB.all;
      query.owner = QUERY_PARAM_OWNER.any;

      this.svc.get(entityId, query)
        .subscribe(data => {
          let ents = new APIResponseParser(data).entities;

          if (ents && ents.length > 0) {
            this.editAndSave(ents[0]);
          }
          else {
            this.core.toast.showWarning("Al parecer el item que intentas editar ya no existe! Estamos actualizando los datos, intenta nuevamente.");
            this.dataRefresh();
          }
        },
          err => {
            throw err
          });
    }
    else {
      this.editAndSave(this.svc.getNew());
    }
  }

  editAndSave(entity: Entity): void {

    this.core.dialog.showEditEntityDialog(this.type, entity)
      .subscribe(result => {

        console.log(`Dialog closed. Result: "${result}" `);

        //If the user does not cancelled the dialog:
        if (typeof result === "object") {
          console.log(`DATA: Name= "${result.name}"`);
          this.svc.save(result)
            .subscribe(data => {

              let respData = new APIResponseParser(data);
              console.log(`After Save`);
              console.log(`Error:"${respData.error}", Payload:"${respData.entities}"`);

              if (!respData.error) {
                this.core.toast.showSuccess("Los cambios se guardaron con éxito!");
                this.dataRefresh();
              }
            });
        }
      });
  }

  delete(entityId: string): void {

    this.core.helper.removeTooltips(this.core.zone);
    this.core.dialog.showConfirmDialog(new ConfirmDialogConfiguration("Confirmación de borrado",
      "¿Confirma la eliminación del item seleccionado?"))
      .subscribe(result => {

        console.log(`Dialog closed. Result: "${result}" `);

        if (result == 1) {
          this.svc.delete(entityId)
            .subscribe(data => {

              let respData = new APIResponseParser(data);

              console.log(`After Delete`);
              console.log(`Error:"${respData.error}", Payload:"${respData.entities}"`);

              if (!respData.error) {
                this.core.toast.showSuccess("El elemento ha sido eliminado.");
                this.dataRefresh();
              }
            }, err => {
              throw err
            });
        }
      });
  }
}
