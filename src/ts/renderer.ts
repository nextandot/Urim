import { UrimCell, UrimPlaneManager } from './urimPlaneManager';
import ToDoTip from './ToDoTip';
import toDoData from './toDoData';
import ToDoDataManager from './toDoDataManager';
import Common from './common';

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('urim-plain');

const tddMng = new ToDoDataManager();

const upm = new UrimPlaneManager();

let toDoTips: ToDoTip[];
let ctx: CanvasRenderingContext2D;

const render = (toDoDatas: toDoData[]) => {
    ctx = upm.setupCanvas(canvas, toDoDatas);
    toDoTips = upm.createToDoTips(canvas, toDoDatas);
    upm.render(canvas, ctx, toDoTips);
}

// toDoを右クリックした際に、toDayの星の色が変わる
canvas.addEventListener('contextmenu', e => {
    e.preventDefault();

    const common = new Common();

    const dpr = window.devicePixelRatio || 1;
    const canvasRect = canvas.getBoundingClientRect();

    const point = {
        x: e.clientX * dpr - canvasRect.left * dpr,
        y: e.clientY * dpr - canvasRect.top * dpr
    };

    // クリック判定処理
    toDoTips.forEach(toDoTip => {
        // TODO: upmにページ判定関数として定義する
        if (toDoTip.page == upm.urimCell[common.imToNum[<keyof { [s: string]: number }>toDoTip.toDoData.getImportance()]][upm.urToCoord(toDoTip.toDoData.getUrgency())].pm.page) {
            if (toDoTip.isClicked(point)) {
                toDoTip.toggleToday(canvas, ctx);
            }
        }
    });

});

canvas.addEventListener('dblclick', e => {
    e.preventDefault();

    const dpr = window.devicePixelRatio || 1;
    const canvasRect = canvas.getBoundingClientRect();

    const point = {
        x: e.clientX * dpr - canvasRect.left * dpr,
        y: e.clientY * dpr - canvasRect.top * dpr
    };

    // クリック判定処理
    toDoTips.forEach(toDoTip => {
        if (toDoTip.isClicked(point)) {
            // ToDo: 詳細画面に遷移する
            // ToDoDataを渡すと詳細画面を描画するAPIが欲しい
            console.log(toDoTip.toDoData.getDetailData());
        }
    });

});

canvas.addEventListener('click', e => {
    e.preventDefault();

    const dpr = window.devicePixelRatio || 1;
    const canvasRect = canvas.getBoundingClientRect();

    const point = {
        x: e.clientX * dpr - canvasRect.left * dpr,
        y: e.clientY * dpr - canvasRect.top * dpr
    };

    // クリック判定処理
    // upm.pgcを全探索して、hasPageのやつだけ、クリック判定する
    upm.urimCell.forEach((imArray: UrimCell[]) => {
        imArray.forEach((cell: UrimCell) => {
            if (cell.pm.hasPages) {
                if (cell.pm.isPrevClicked(point)) {
                    cell.pm.page -= 1;
                    if (cell.pm.page < cell.pm.minPage) {
                        cell.pm.page = cell.pm.maxPage;
                    }
                    upm.render(canvas, ctx, toDoTips);
                }
                else if (cell.pm.isNextClicked(point)) {
                    cell.pm.page += 1;
                    if (cell.pm.page > cell.pm.maxPage) {
                        cell.pm.page = cell.pm.minPage;
                    }
                    upm.render(canvas, ctx, toDoTips);
                }
            }
        })
    })
});

// 初期読み込み時は、renderに加えて、json読み込みとか行う
window.onload = () => {
    tddMng.import();
    render(tddMng.toDoDataArray);
};

// リサイズのたびに、toDoDataを読み込んでrenderする
window.addEventListener('resize', () => { render(tddMng.toDoDataArray) }, false);

// 概要モード画面に遷移
const abstBtn = document.getElementById('abst-btn');
abstBtn.addEventListener('click', () => {
    localStorage.setItem('toDoDataArray', JSON.stringify(tddMng.toDoDataArray));
    location.href = '../html/abst.html';
}, false);
