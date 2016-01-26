function Cell(elem){
  this.elem = elem;
}

Cell.prototype.DEAD = 'dead';
Cell.prototype.ALIVE = 'alive';

Cell.prototype.setRandom = function(){
  var states = [this.DEAD, this.ALIVE];
  var state = states[Math.floor(Math.random() * 2)];
  this.elem.className = state;
  this.elem.setAttribute('data-status', state);
};

Cell.prototype.getStatus = function(){
  return this.elem.className === this.DEAD ? 'dead' : 'alive';
};

Cell.prototype.clear = function(){
  this.elem.className = this.DEAD;
  this.elem.setAttribute('data-status', this.DEAD);
};

Cell.prototype.getNeighbors = function(){
  var steps = [-1, 0, 1];
  var parts = this.elem.id.split('-');
  var x = parts[0]*1;
  var y = parts[1]*1;
  var neighbors = [];
  for(var i = 0; i < steps.length; i++)
    for(var j = 0; j < steps.length; j++){
      var _x = x + steps[i];
      var _y = y + steps[j];
      var _id = _x + '-' + _y;
      var _elem = document.getElementById(_id);
      if(_elem && _elem !== this.elem)
        neighbors.push(new Cell(_elem));
    }
  return neighbors;
};

Cell.prototype.livingNeighbors = function(){
  var neighbors = this.getNeighbors();
  return neighbors.filter(function(neighbor){
    return neighbor.getStatus() === this.ALIVE;
  }, this).length;
};

Cell.prototype.getNextStatus = function(){
  var living = this.livingNeighbors();
  if(this.getStatus() === this.ALIVE)
    return living === 2 || living === 3 ? this.ALIVE : this.DEAD; 
  return living === 3 ? this.ALIVE : this.DEAD;
};

Cell.prototype.setNextStatus = function(){
  this.elem.setAttribute('data-status', this.getNextStatus());
};

Cell.prototype.preStep = function(){
  this.setNextStatus();
}

Cell.prototype.step = function(){
  this.elem.className = this.elem.getAttribute('data-status');
}

var gameOfLife = {
  intervalId: null,
  width: 12,
  height: 12,
  stepInterval: null,

  createAndShowBoard: function () {
    // create <table> element
    var goltable = document.createElement("tbody");
    
    // build Table HTML
    var tablehtml = '';
    for (var h=0; h<this.height; h++) {
      tablehtml += "<tr id='row+" + h + "'>";
      for (var w=0; w<this.width; w++) {
        tablehtml += "<td data-status='dead' id='" + w + "-" + h + "'></td>";
      }
      tablehtml += "</tr>";
    }
    goltable.innerHTML = tablehtml;
    
    // add table to the #board element
    var board = document.getElementById('board');
    board.appendChild(goltable);
    
    // once html elements are added to the page, attach events to them
    this.setupBoardEvents();
  },

  forEachCell: function (iteratorFunc) {
    for(var i = 0 ; i < this.width ; i++)
      for(var j = 0 ; j < this.height ; j++)
        iteratorFunc(new Cell(document.getElementById(i + '-' + j)));
  },
  
  setupBoardEvents: function() {
    var onCellClick = function (e) {
      // QUESTION TO ASK YOURSELF: What is "this" equal to here?
      
      // how to set the style of the cell when it's clicked
      if (this.getAttribute('data-status') == 'dead') {
        this.className = "alive";
        this.setAttribute('data-status', 'alive');
      } else {
        this.className = "dead";
        this.setAttribute('data-status', 'dead');
      }
    };
    

    this.forEachCell(function(cell){
      cell.elem.onclick = onCellClick;
    });
    document.getElementById('clear_btn').onclick = this.clear.bind(this);
    document.getElementById('reset_btn').onclick = this.reset.bind(this);
    document.getElementById('step_btn').onclick = this.step.bind(this);
    document.getElementById('play_btn').onclick = this.enableAutoPlay.bind(this);
    document.getElementById('reset_btn').click();
  },
  reset: function(){
    this.forEachCell(function(cell){
      cell.setRandom();
    });
    if(this.intervalId){
      clearInterval(this.intervalId)
      this.intervalId = null;
    }
  },
  clear: function(){
    if(this.intervalId){
      clearInterval(this.intervalId)
      this.intervalId = null;
    }
    this.forEachCell(function(cell){
      cell.clear();
    });
  },

  step: function () {
    this.forEachCell(function(cell){
      cell.preStep();
    });

    this.forEachCell(function(cell){
      cell.step();
    });
  },

  enableAutoPlay: function () {
    if(this.intervalId)
      return;
    var that = this;
    this.intervalId = setInterval(function(){
      that.step();
    }, 500);
  }
};

  gameOfLife.createAndShowBoard();
