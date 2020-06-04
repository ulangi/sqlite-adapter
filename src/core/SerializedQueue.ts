import { when, observable, IObservableValue } from "mobx"

export class SerializedQueue {

  private nextNumber: number
  private currentNumber: IObservableValue<number>
  private isCanceled: IObservableValue<boolean>

  public constructor() {
    this.nextNumber = 0
    this.currentNumber = observable.box(0)
    this.isCanceled = observable.box(false)
  }

  public async enqueue(): Promise<void> {
    return new Promise((resolve, reject): void => {
      const targetNumber = this.nextNumber

      when(
        (): boolean => this.currentNumber.get() === targetNumber || this.isCanceled.get(),
        (): void => {
          if (this.isCanceled.get()) {
            reject("QUEUE CANCELED")
          }
          else {
            resolve()
          }
        }
      )

      this.nextNumber += 1
    })
  }

  public dequeue(): void {
    this.currentNumber.set(this.currentNumber.get() + 1)
  }

  public cancel(): void {
    this.isCanceled.set(true)
  }
}
