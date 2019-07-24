import { Component, Input, Output, EventEmitter, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { WizardStepComponent } from "./wizard-step.component";

@Component({
  selector: 'wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})

export class WizardComponent implements AfterContentInit {
  @ContentChildren(WizardStepComponent)
  wizardSteps: QueryList<WizardStepComponent>;

  /**
   * Indicates if the buttons must remain hidden enabling the tabs as the only navigation method.
   */
  @Input("hide-buttons") hideButtons: boolean = false;
  @Input("default-tab") defaultTab: string = ""

  private _steps: Array<WizardStepComponent> = [];
  private _isCompleted: boolean = false;

  @Output()
  onStepChanged: EventEmitter<WizardStepComponent> = new EventEmitter<WizardStepComponent>();

  constructor() { }

  ngAfterContentInit() {

    let hasActiveStep: boolean = false

    if (this.wizardSteps && this.wizardSteps.length > 0) {

      this.wizardSteps.forEach((step) => {

        if (this.hideButtons) {
          step.isDisabled = false;
        }

        if (this.defaultTab && step.title == this.defaultTab) {
          step.isActive = true;
          hasActiveStep = true;
        }

        this._steps.push(step)
      });

      if (!hasActiveStep) {
        this._steps[0].isActive = true; //By default, first tab will be the active one.
      }
    }
    else {
      throw new Error("The wizard has no steps added!");
    }
  }

  get steps(): Array<WizardStepComponent> {
    return this._steps.filter(step => !step.hidden);
  }

  get isCompleted(): boolean {
    return this._isCompleted;
  }

  get activeStep(): WizardStepComponent {
    return this.steps.find(step => step.isActive);
  }

  set activeStep(step: WizardStepComponent) {
    if (step !== this.activeStep && !step.isDisabled) {
      this.activeStep.isActive = false;
      step.isActive = true;
      this.onStepChanged.emit(step);
    }
  }

  public get activeStepIndex(): number {
    return this.steps.indexOf(this.activeStep);
  }

  get hasNextStep(): boolean {
    return this.activeStepIndex < this.steps.length - 1;
  }

  get hasPrevStep(): boolean {
    return this.activeStepIndex > 0;
  }

  public goToStep(step: WizardStepComponent): void {
    if (!this.isCompleted && this.activeStep.isValid) {
      this.activeStep = step;
    }
  }

  public next(): void {
    if (this.hasNextStep) {
      let nextStep: WizardStepComponent = this.steps[this.activeStepIndex + 1];
      this.activeStep.onNext.emit();
      nextStep.isDisabled = false;
      this.activeStep = nextStep;
    }
  }

  public previous(): void {
    if (this.hasPrevStep) {
      let prevStep: WizardStepComponent = this.steps[this.activeStepIndex - 1];
      this.activeStep.onPrev.emit();
      prevStep.isDisabled = false;
      this.activeStep = prevStep;
    }
  }

  public reset() {
    this.activeStep = this.steps[0];
    for (let step of this.steps) {
      step.isDisabled = true;
      step.isDirty = false;
    }
    this.activeStep.isDisabled = false;
    this.activeStep.isActive = true;
    this._isCompleted = false;
  }

  public complete(): void {
    this._isCompleted = true;
    this.activeStep.onComplete.emit();
  }
}
