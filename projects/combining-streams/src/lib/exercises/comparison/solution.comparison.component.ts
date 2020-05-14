import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {combineLatest, fromEvent, ReplaySubject, Subscription, zip} from "rxjs";
import {map, shareReplay, startWith, tap, withLatestFrom} from "rxjs/operators";

@Component({
  selector: 'withLatestFrom',
  template: `<h3>(Solution) withLatestFrom</h3>

  <div #box class="box">
    <div class="separation">
    </div>
    <div class="click-result">
      combineLatest:
      <b>{{clickResultCombine$ | async}}</b>
    </div>
    <div class="click-result">
      withLatestFrom:
      <b>{{clickResultWithLatest$ | async}}</b>
    </div>
    <div class="click-result">
      zip:
      <b>{{clickResultZip$ | async}}</b>
    </div>
  </div>

  `,
  styleUrls: ['./comparison.component.scss']
})
export class SolutionComparisonComponent implements AfterViewInit, OnDestroy {
  subscription = new Subscription();

  @ViewChild('box')
  boxViewChild;

  clickResultCombine$ = new ReplaySubject<string>(1);
  clickResultWithLatest$ = new ReplaySubject<string>(1);
  clickResultZip$ = new ReplaySubject<string>(1);

  constructor(private elemRef: ElementRef) {
  }

  ngAfterViewInit(): void {
    const clickPosX$ = fromEvent(this.boxViewChild.nativeElement, 'click').pipe(
      tap((e: any) => {
        const elem = this.elemRef.nativeElement.querySelector('.click-pos');
        elem.style.top = `${e.offsetY - 15}px`;
        elem.style.left = `${e.offsetX - 15}px`;
        elem.style.display = 'block';
      }),
      map((e) => e['offsetX']),
      shareReplay(1)
    );

    const elemWith$ = fromEvent(window, 'resize').pipe(
      map(() => this.boxViewChild.nativeElement.getBoundingClientRect().width),
      startWith(this.boxViewChild.nativeElement.getBoundingClientRect().width),
      shareReplay(1)
    );

    this.subscription.add(
      combineLatest([clickPosX$, elemWith$])
        .pipe(
          map(([posX, width]) => this.getSideOfClick(posX, width)),
        ).subscribe(this.clickResultCombine$)
    );

    this.subscription.add(clickPosX$
      .pipe(
        withLatestFrom(elemWith$),
        map(([posX, width]) => this.getSideOfClick(posX, width))
      ).subscribe(this.clickResultWithLatest$)
    );

    this.subscription.add(zip(clickPosX$, elemWith$)
      .pipe(
        map(([posX, width]) => this.getSideOfClick(posX, width))
      ).subscribe(this.clickResultZip$)
    );

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

  getSideOfClick(posX: number, width: number) {
    return (width / 2) < posX ? 'Right' : 'Left';
  }

}
