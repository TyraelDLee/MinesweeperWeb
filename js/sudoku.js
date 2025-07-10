;!function (){
    let remains = [0,0,0,0,0,0,0,0,0], board, maskedBoard;

    class Node {
        constructor() {
            this.left = this.right = this.up = this.down = this;
            this.column = null;
            this.rowID = -1;
            this.nodeID = -1;
        }
    }

    class ColumnNode extends Node {
        constructor(name) {
            super();
            this.size = 0;
            this.name = name;
            this.column = this;
        }
    }

    class DLX {
        constructor(matrix, rowIDs) {
            this.header = new ColumnNode("header");
            this.columns = [];
            this.solution = [];
            this.rowIDs = rowIDs;
            this.buildDLX(matrix);
        }

        buildDLX(matrix) {
            let cols = matrix[0].length;
            for (let i = 0; i < cols; i++) {
                let col = new ColumnNode(i);
                this.columns.push(col);
                this.header.left.right = col;
                col.right = this.header;
                col.left = this.header.left;
                this.header.left = col;
            }

            for (let i = 0; i < matrix.length; i++) {
                let first = null;
                for (let j = 0; j < cols; j++) {
                    if (matrix[i][j] === 1) {
                        let col = this.columns[j];
                        let node = new Node();
                        node.column = col;
                        node.rowID = i;
                        col.size++;

                        // vertical links
                        node.down = col;
                        node.up = col.up;
                        col.up.down = node;
                        col.up = node;

                        // horizontal links
                        if (first) {
                            node.left = first.left;
                            node.right = first;
                            first.left.right = node;
                            first.left = node;
                        } else {
                            first = node;
                            node.left = node.right = node;
                        }
                    }
                }
            }
        }

        cover(col) {
            col.right.left = col.left;
            col.left.right = col.right;

            for (let i = col.down; i !== col; i = i.down) {
                for (let j = i.right; j !== i; j = j.right) {
                    j.down.up = j.up;
                    j.up.down = j.down;
                    j.column.size--;
                }
            }
        }

        uncover(col) {
            for (let i = col.up; i !== col; i = i.up) {
                for (let j = i.left; j !== i; j = j.left) {
                    j.column.size++;
                    j.down.up = j;
                    j.up.down = j;
                }
            }
            col.right.left = col;
            col.left.right = col;
        }

        search(k = 0) {
            if (this.header.right === this.header) {
                return this.solution.map(i => this.rowIDs[i]);
            }

            let col = this.selectColumn();
            if (!col) return null;

            this.cover(col);
            for (let r = col.down; r !== col; r = r.down) {
                this.solution[k] = r.rowID;
                for (let j = r.right; j !== r; j = j.right) {
                    this.cover(j.column);
                }
                let result = this.search(k + 1);
                if (result) return result;
                for (let j = r.left; j !== r; j = j.left) {
                    this.uncover(j.column);
                }
            }
            this.uncover(col);
            return null;
        }

        selectColumn() {
            let min = Infinity, chosen = null;
            for (let c = this.header.right; c !== this.header; c = c.right) {
                if (c.size < min) {
                    min = c.size;
                    chosen = c;
                }
            }
            return chosen;
        }
    }

    //Init game
    function initBoard(initCount){
        let cache = new Map(), set = new Set();
        while(cache.size < initCount){
            let i = random(0,8), j = random(0,8), k = random(1,9);
            let a = i * 9 + j;
            if (set.has(a))
                continue;
            let b = i * 9 + k + 80;
            if (set.has(b))
                continue;
            let c = j * 9 + k + 161;
            if (set.has(c))
                continue;
            let d = (Math.floor(i / 3) * 3 + Math.floor(j / 3)) * 9 + k + 242
            if (set.has(d))
                continue;
            set.add(a);
            set.add(b);
            set.add(c);
            set.add(d);
            cache.set(`${i}-${j}`, k);
        }
        return cache;
    }

    function random(min=0, max){
        return Math.floor(Math.random() * (max+1 - min)) + min;
    }

    function formatInitialStep(map){
        let table = [];
        for (let i = 0; i < 9; i++) {
            let row = [0,0,0,0,0,0,0,0,0];
            table.push(row);
        }
        for (let key of map.keys()){
            let x = key.split('-')[0]-0, y = key.split('-')[1]-0;
            table[y][x] = map.get(key);
        }
        return table;
    }

    function sudokuToMatrix(board) {
        const N = 9, matrix = [], rowIDs = [];

        const encode = (r, c, d) => {
            const row = Array(324).fill(0);
            row[r * 9 + c] = 1;
            row[81 + r * 9 + d] = 1;
            row[162 + c * 9 + d] = 1;
            row[243 + (Math.floor(r / 3) * 3 + Math.floor(c / 3)) * 9 + d] = 1;
            return row;
        };

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                let val = board[r][c];
                if (val > 0) {
                    matrix.push(encode(r, c, val - 1));
                    rowIDs.push({ r, c, d: val - 1 });
                } else {
                    for (let d = 0; d < 9; d++) {
                        matrix.push(encode(r, c, d));
                        rowIDs.push({ r, c, d });
                    }
                }
            }
        }

        return { matrix, rowIDs };
    }

    function solveSudoku(board) {
        const { matrix, rowIDs } = sudokuToMatrix(board);
        const dlx = new DLX(matrix, rowIDs);
        const solution = dlx.search();

        if (!solution) return null;

        const result = Array.from({ length: 9 }, () => Array(9).fill(0));
        for (let { r, c, d } of solution) {
            result[r][c] = d + 1;
        }
        return result;
    }

    for (let difficulty of document.getElementsByClassName('difficulty-item')) {
        difficulty.onclick = ()=>{
            switch (difficulty.getAttribute('difficulty')-0) {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    break;
                case 5:
                    break;
            }
        };
    }
    start();
    function start(){
        remains = [0,0,0,0,0,0,0,0,0];
        let m = initBoard(11);
        console.log(m)
        console.log(formatInitialStep(m));
        board = solveSudoku(formatInitialStep(m));
        console.log(board);
        maskedBoard = generateBoard(board, 30);
        fillBoard(maskedBoard);
        console.log(maskedBoard);
        updateRemains();
    }

    function generateBoard(board, numOfMask){
        let mask = new Set(), newBoard = structuredClone(board);
        while (mask.size < numOfMask){
            mask.add(`${random(0,8)}-${random(0,8)}`);
        }
        for (let m of mask){
            newBoard[m.split('-')[1]-0][m.split('-')[0]-0] = 0;
            remains[board[m.split('-')[1]-0][m.split('-')[0]-0]-1] ++;
        }
        return newBoard;
    }

    function fillBoard(board){
        const blocks = document.getElementsByClassName('board-section')[0].getElementsByClassName('number-block');
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if(board[i][j]>0) {
                    blocks[i * 9 + j].getElementsByClassName('number-fill')[0].innerText = board[i][j];
                    blocks[i * 9 + j].getElementsByClassName('number-fill')[0].classList.add("solid-fill");
                }
            }
        }
    }

    function fillSolution(board, answer){
        const blocks = document.getElementsByClassName('board-section')[0].getElementsByClassName('number-block');
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) {
                    blocks[i * 9 + j].getElementsByClassName('number-fill')[0].innerText = answer[i][j];
                    board[i][j] = 0-answer[i][j];
                }
            }
        }
        remains = [0,0,0,0,0,0,0,0,0];
        updateRemains();
    }

    function updateRemains(){
        for (let i = 0; i < 9; i++) {
            document.getElementsByClassName('tool-section')[0].getElementsByClassName('number-block')[i].getElementsByClassName('remains')[0].innerText=remains[i];
        }
    }
    document.onkeyup = (e)=>{
        if (e.key === 's')
            fillSolution(maskedBoard, board);
    }

    // mouse hover event
    for(let block of document.getElementsByClassName('board-section')[0].getElementsByClassName('number-block')){
        block.onmouseover = ()=>{
            let pos = block.getAttribute('coord').split('-');
            for(let otherBlock of document.getElementsByClassName('board-section')[0].getElementsByClassName('number-block')){
                let otherPos = otherBlock.getAttribute('coord').split('-');
                if (otherPos[0]-0 === pos[0]-0 || otherPos[1]-0 === pos[1]-0 || otherPos[2]-0 === pos[2]-0)
                    otherBlock.classList.add('block-hover');
            }
        };
        block.onmouseout = ()=>{
            let pos = block.getAttribute('coord').split('-');
            for(let otherBlock of document.getElementsByClassName('board-section')[0].getElementsByClassName('number-block')){
                let otherPos = otherBlock.getAttribute('coord').split('-');
                if (otherPos[0]-0 === pos[0]-0 || otherPos[1]-0 === pos[1]-0 || otherPos[2]-0 === pos[2]-0)
                    otherBlock.classList.remove('block-hover');
            }
        }
        block.onclick = ()=>{
            switch (document.body.getAttribute('mode')) {
                case 'erase':
                    break;
                case 'erase-hold':
                    break;
                default:
                    break;
            }
            let pos = block.getAttribute('coord').split('-');
            let previousSelected = -10;
            if (block.classList.contains('current-selected')){
                previousSelected = -11;
            }
            if (maskedBoard[pos[0]-0][pos[1]-0]>0){
                let selection = block.getElementsByClassName('number-fill')[0].innerText - 0;
                for(let block of document.getElementsByClassName('board-section')[0].getElementsByClassName('number-block')){
                    block.classList.remove('current-selected');
                    let pos = block.getAttribute('coord').split('-');

                    if (Math.abs(maskedBoard[pos[0]-0][pos[1]-0]) === selection && -10 === previousSelected){
                        block.classList.add('current-selected');
                    }
                }
                document.body.setAttribute('mode','');
            }

            if (document.body.getAttribute('mode').includes('number-selection')){
                let fillingNumber = document.body.getAttribute('mode').replace("number-selection-", "")-0;
                if(maskedBoard[pos[0]-0][pos[1]-0] <= 0 && maskedBoard[pos[0]-0][pos[1]-0] !== 0 - fillingNumber){
                    maskedBoard[pos[0]-0][pos[1]-0] = 0 - fillingNumber;
                    block.getElementsByClassName('number-fill')[0].innerText = fillingNumber;
                    remains[fillingNumber-1]--;
                }
                else if(maskedBoard[pos[0]-0][pos[1]-0] === 0 - fillingNumber){
                    maskedBoard[pos[0]-0][pos[1]-0] = 0;
                    block.getElementsByClassName('number-fill')[0].innerText = '';
                    remains[fillingNumber-1]++;
                    block.classList.remove('current-selected');
                }
                if(remains[fillingNumber-1]===0)
                    document.body.setAttribute('mode','');
                updateRemains();
            }
        };
    }

    for (let block of document.getElementsByClassName('number-selection')[0].getElementsByClassName('number-block')){
        block.onclick = ()=>{
            let previousSelected = -1;
            if (document.body.getAttribute('mode').includes('number-selection')){
                previousSelected = document.body.getAttribute('mode').replace('number-selection-', '')-0;
            }
            document.body.setAttribute('mode','');
            document.body.setAttribute("mode", `number-${block.id}`);

            let selection = block.id.substring(block.id.length-1, block.id.length)-0;
            for(let block of document.getElementsByClassName('board-section')[0].getElementsByClassName('number-block')){
                block.classList.remove('current-selected');
                let pos = block.getAttribute('coord').split('-');
                if (Math.abs(maskedBoard[pos[0]-0][pos[1]-0]) === selection && selection !== previousSelected){
                    block.classList.add('current-selected');
                }
            }
            if (previousSelected === selection)
                document.body.setAttribute('mode','');
        };
    }

    document.getElementById('erase').onclick = ()=>{
        document.body.setAttribute('mode', 'erase');
    };

}();