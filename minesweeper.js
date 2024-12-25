!function () {
    const blockSize = 25;
    let diff = document.getElementById('difficulty-section'), timerHost = null;

    for (let d of diff.getElementsByTagName('div')) {
        d.addEventListener('click', () => {
            for (let elem of diff.getElementsByTagName('div'))
                elem.classList.remove('selected');
            if (d.classList.contains('selected')) d.classList.remove('selected')
            else d.classList.add('selected');
            switch (d.id) {
                case "easy":
                    initGame(9, 9, 10);
                    break;
                case "mid":
                    initGame(16, 16, 40);
                    break;
                case "hard":
                    initGame(16, 30, 99);
                    break;
                case "custom":
                    for (let input of d.getElementsByTagName('input')) {
                        input.addEventListener('change', () => {
                            customizeGame(d)
                        })
                    }
                    break;
            }
        });
    }

    function customizeGame(d) {
        let height = d.getElementsByTagName('input')[1].value - 0,
            width = d.getElementsByTagName('input')[0].value - 0,
            mine = d.getElementsByTagName('input')[2].value - 0;
        if (height < 9) {
            d.getElementsByTagName('input')[1].value = 9;
            height = 9;
        }
        if (height > 65) {
            d.getElementsByTagName('input')[1].value = 65;
            height = 65;
        }
        if (width < 9) {
            d.getElementsByTagName('input')[0].value = 9;
            width = 9;
        }
        if (width > 65) {
            d.getElementsByTagName('input')[0].value = 65;
            width = 65;
        }
        if (height * width * 0.38 < mine) {
            mine = Math.floor(height * width * 0.38) + '';
            d.getElementsByTagName('input')[2].value = mine;
        }

        d.getElementsByTagName('button')[0].onclick = ()=>{
            if (width > 0 && height > 0 && mine > 0) {
                initGame(height, width, mine)
            }
        }
    }

    function setGameBoardPosition(width, height) {
        let boardWidth = width * blockSize, gameBoard = document.getElementById('game-board'), mineArea = document.getElementById('mine-area'), topArea = document.getElementById('top-area');

        mineArea.setAttribute('style', `width: ${width * blockSize}px; height: ${height * blockSize}px;`);
        topArea.setAttribute('style', `width: ${width * blockSize}px; height: ${2 * blockSize}px; display: flex;`);

        mineArea.style.marginLeft = window.outerWidth - boardWidth < 0?0:(window.outerWidth - boardWidth) / 2 + 'px';
        topArea.style.marginLeft = window.outerWidth - boardWidth < 0?0:(window.outerWidth - boardWidth) / 2 + 'px';

    }

    function initGame(height, width, mine) {
        clearInterval(timerHost);
        setGameBoardPosition(width, height);
        window.onresize = () => {
            setGameBoardPosition(width, height);
        }
        setMineRemain(mine);
        let map = [], mouseDown = false, blockArr = [], firstClick = true, remainingMine = mine;
        let mineArea = document.getElementById('mine-area');
        mineArea.innerHTML = '';
        mineArea.onmouseleave = () => {
            mouseDown = false
        }
        for (let y = 0; y < height; y++) {
            let row = document.createElement('div');
            row.classList.add('row')
            let rowData = [], rowBlock = [];
            for (let x = 0; x < width; x++) {
                let block = document.createElement('div');
                block.setAttribute('coord', `${y}-${x}`);
                block.classList.add('game-block', 'closed');
                row.append(block);
                rowData.push(0);
                block.onmousedown = (e) => {
                    if (e.button === 0) {
                        mouseDown = true;
                        block.classList.add('pressed');
                        block.classList.remove('closed');
                    }
                }
                block.onmouseup = (e) => {
                    if (e.button === 0 && mouseDown) {
                        mouseDown = false;
                        if (firstClick){
                            firstClick = false;
                            setTimer();
                        }
                        block.classList.remove('pressed');
                        let y = block.getAttribute('coord').split('-')[0] - 0,
                            x = block.getAttribute('coord').split('-')[1] - 0;
                        if(!block.classList.contains('flagged')){
                            if (!block.classList.contains('fixed')) {
                                block.classList.add('fixed');
                                block.classList.add('opened');
                                // block.classList.remove('pressed');
                                switch (map[y][x]) {
                                    case 0:
                                        block.classList.add('b-0');
                                        quickFlap(x, y);
                                        break;
                                    case 1:
                                        block.classList.add('b-1');
                                        break;
                                    case 2:
                                        block.classList.add('b-2');
                                        break;
                                    case 3:
                                        block.classList.add('b-3');
                                        break;
                                    case 4:
                                        block.classList.add('b-4');
                                        break;
                                    case 5:
                                        block.classList.add('b-5');
                                        break;
                                    case 6:
                                        block.classList.add('b-6');
                                        break;
                                    case 7:
                                        block.classList.add('b-7');
                                        break;
                                    case 8:
                                        block.classList.add('b-8');
                                        break;
                                    case 9:
                                        block.classList.add('b-hm');
                                        hitMine();
                                        break;
                                }
                            } else {
                                if (map[y][x] > 0 && map[y][x] < 9) {
                                    console.log("disp")
                                    quickPick(y, x)
                                }
                            }
                            win();
                        }

                    }
                }
                block.onmouseover = (e) => {
                    if (mouseDown) {
                        block.classList.add('pressed');
                        block.classList.remove('closed');
                    }
                }
                block.onmouseleave = (e) => {
                    if (mouseDown) {
                        block.classList.remove('pressed');
                        block.classList.add('closed');
                    }
                }
                block.oncontextmenu = () => {
                    if (!block.classList.contains('fixed')) {
                        if (block.classList.contains('flagged')) {
                            block.classList.remove('flagged');
                            remainingMine++;
                            setMineRemain(remainingMine);
                        }
                        else {
                            block.classList.add('flagged');
                            remainingMine--;
                            setMineRemain(remainingMine);
                            win();
                        }
                    }
                    return false;
                }
                rowBlock.push(block);
            }
            map.push(rowData);
            mineArea.append(row);
            blockArr.push(rowBlock);
        }
        generateBoard();

        function generateBoard() {
            let mineMap = new Map();
            while (mineMap.size < mine) {
                let x = Math.floor(Math.random() * (width)), y = Math.floor(Math.random() * height);
                map[y][x] = 9;
                mineMap.set(x + ' ' + y, "");
            }
            let newMap = [];
            for (let y = 0; y < map.length; y++) {
                let row = []
                for (let x = 0; x < map[y].length; x++) {
                    let numOfMineNearBy = 0, lx = -1, ly = -1;
                    for (let k = 0; k < 8; k++) {
                        if (x + lx >= 0 && x + lx < map[y].length && y + ly >= 0 && y + ly < map.length) {
                            if (map[y + ly][x + lx] === 9 && map[y][x] !== 9) {
                                numOfMineNearBy++;
                            }
                        }
                        lx++;
                        if (k === 3)
                            lx++;
                        if (lx === 2) {
                            ly++;
                            lx = -1;
                        }

                    }
                    if (map[y][x] === 9)
                        row.push(9);
                    else
                        row.push(numOfMineNearBy);
                }
                newMap.push(row);
            }
            map = newMap;
            console.log(map)

            document.onkeyup = (e)=>{
                if (e.key === 's')
                    getSolution();
            }
        }

        function quickPick(y, x) {
            let lx = -1, ly = -1, flagged = 0, numOfMineNearBy = map[y][x];
            for (let k = 0; k < 8; k++) {
                if (x + lx >= 0 && x + lx < map[y].length && y + ly >= 0 && y + ly < map.length) {
                    if (blockArr[y + ly][x + lx].classList.contains('flagged')) {
                        flagged++;
                    }
                }
                lx++;
                if (k === 3)
                    lx++;
                if (lx === 2) {
                    ly++;
                    lx = -1;
                }
            }
            lx = -1;
            ly = -1;
            for (let k = 0; k < 8; k++) {
                if (x + lx >= 0 && x + lx < map[y].length && y + ly >= 0 && y + ly < map.length) {
                    let localBlock = blockArr[y + ly][x + lx];
                    if (!localBlock.classList.contains('fixed') && !localBlock.classList.contains('flagged')) {
                        if (numOfMineNearBy === flagged) {
                            let e = document.createEvent("MouseEvents");
                            e.initEvent("mousedown", false, false);
                            localBlock.dispatchEvent(e);
                            e.initEvent("mouseup", false, false);
                            localBlock.dispatchEvent(e);

                        } else {
                            localBlock.classList.add('pressed');
                            localBlock.classList.remove('closed');
                            setTimeout(()=>{
                                localBlock.classList.remove('pressed');
                                localBlock.classList.add('closed');
                            }, 150);
                        }
                    }


                }
                lx++;
                if (k === 3)
                    lx++;
                if (lx === 2) {
                    ly++;
                    lx = -1;
                }

            }
        }

        function quickFlap(x, y) {
            let lx = -1, ly = -1
            if(map[y][x] === 0){
                for (let k = 0; k < 8; k++) {
                    if(x + lx >= 0 && x + lx < map[y].length && y + ly >= 0 && y + ly < map.length){
                        let block = blockArr[y + ly][x + lx];
                        if (!block.classList.contains('opened')) {
                            // let e = document.createEvent("MouseEvents");
                            // e.initEvent("mousedown", false, false);
                            // block.dispatchEvent(e);
                            // e.initEvent("mouseup", false, false);
                            // block.dispatchEvent(e);
                            block.classList.add('fixed');
                            block.classList.add('opened');
                            block.classList.remove('pressed');
                            block.classList.remove('closed');
                            switch (map[y + ly][x + lx]) {
                                case 0:
                                    block.classList.add('b-0');
                                    // quickFlap(x, y);
                                    break;
                                case 1:
                                    block.classList.add('b-1');
                                    break;
                                case 2:
                                    block.classList.add('b-2');
                                    break;
                                case 3:
                                    block.classList.add('b-3');
                                    break;
                                case 4:
                                    block.classList.add('b-4');
                                    break;
                                case 5:
                                    block.classList.add('b-5');
                                    break;
                                case 6:
                                    block.classList.add('b-6');
                                    break;
                                case 7:
                                    block.classList.add('b-7');
                                    break;
                                case 8:
                                    block.classList.add('b-8');
                                    break;
                                case 9:
                                    block.classList.add('b-hm');
                                    hitMine();
                                    break;
                            }
                            quickFlap(x+lx, y+ly);
                        }
                    }

                    lx++;
                    if (k === 3)
                        lx++;
                    if (lx === 2) {
                        ly++;
                        lx = -1;
                    }
                }
            }
        }

        function hitMine(mine=true){
            clearInterval(timerHost)
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[y].length; x++) {
                    if (map[y][x] === 9 && !blockArr[y][x].classList.contains('flagged') && mine)
                        blockArr[y][x].classList.add('b-m');
                    blockArr[y][x].onmousedown = null;
                    blockArr[y][x].onmouseup = null;
                    blockArr[y][x].onmouseover = null;
                    blockArr[y][x].onmouseleave = null;
                    blockArr[y][x].oncontextmenu = ()=>{
                        return false;
                    };
                }
            }
        }

        function win(){
            if (checkWin()){
                hitMine(false);
                console.log('win!')
            }
        }

        function checkWin(){
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[y].length; x++) {
                    if (remainingMine > 0 && map[y][x] === 9 && !blockArr[y][x].classList.contains('flagged') && (map[y][x]<9 && !blockArr[y][x].classList.contains('opened'))){
                        return false;
                    }else if(map[y][x]<9 && !blockArr[y][x].classList.contains('opened')){
                        return false;
                    }
                }
            }
            return true;
        }

        function setMineRemain(mineRemain){
            let element = document.getElementById('mine-remain');
            mineRemain = String(mineRemain).padStart(3,'0');

            for (let i = 1; i <= 3; i++) {
                element.getElementsByTagName('img')[3-i].src = `assets/d${mineRemain.charAt(3-i)}.svg`;
            }
        }

        function setTimer(){
            let time = 0;
            timerHost = setInterval(()=>{
                if (time<999){
                    time++;
                    let text = String(time).padStart(3, '0');
                    let element = document.getElementById('timer');
                    for (let i = 1; i <= 3; i++) {
                        element.getElementsByTagName('img')[3-i].src = `assets/d${text.charAt(3-i)}.svg`;
                    }
                }
            }, 1000);

        }

        function getSolution(){
            for (let y = 0; y < map.length; y++) {
                for (let x = 0; x < map[y].length; x++) {
                    let block = blockArr[y][x];
                    let e = document.createEvent("MouseEvents");
                    if(map[y][x] !== 9) {


                        e.initEvent("mousedown", false, false);
                        block.dispatchEvent(e);
                        e.initEvent("mouseup", false, false);
                        block.dispatchEvent(e);
                    }
                    if (map[y][x] === 9){
                        e.initEvent("contextmenu", false, false);
                        block.dispatchEvent(e);
                    }
                }
            }
        }
    }


}();